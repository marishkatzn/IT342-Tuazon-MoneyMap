package com.it342.moneymap.income;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.it342.moneymap.income.dto.CreateIncomeCheckoutRequest;
import com.it342.moneymap.income.dto.CreateIncomeCheckoutResponse;
import com.it342.moneymap.income.dto.IncomeDto;
import com.it342.moneymap.income.dto.IncomeSuccessRequest;
import com.it342.moneymap.income.dto.IncomeSuccessResponse;
import com.it342.moneymap.income.Income;
import com.it342.moneymap.notifications.Notification;
import com.it342.moneymap.users.User;
import com.it342.moneymap.income.IncomeRepository;
import com.it342.moneymap.notifications.NotificationRepository;
import com.it342.moneymap.users.UserRepository;
import java.io.IOException;
import java.math.BigDecimal;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.time.LocalDate;
import java.util.Base64;
import java.util.List;
import java.util.stream.Collectors;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
public class IncomeService {

    private static final String PAYMONGO_CHECKOUT_URL = "https://api.paymongo.com/v1/checkout_sessions";

    @Autowired
    private IncomeRepository incomeRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private NotificationRepository notificationRepository;

    @Autowired
    private ObjectMapper objectMapper;

    @Value("${app.paymongo.secret-key:}")
    private String payMongoSecretKey;

    @Value("${app.frontend.base-url:http://localhost:3000}")
    private String frontendBaseUrl;

    private final HttpClient httpClient = HttpClient.newHttpClient();

    public List<IncomeDto> getIncomesByUserId(Long userId) {
        return incomeRepository.findByUserId(userId).stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    public IncomeDto createIncome(IncomeDto incomeDto) {
        User user = userRepository.findById(incomeDto.getUserId())
                .orElseThrow(() -> new RuntimeException("User not found"));

        Income income = new Income();
        income.setUser(user);
        income.setSourceName(incomeDto.getSourceName());
        income.setCategory(incomeDto.getCategory());
        income.setAmount(incomeDto.getAmount());
        income.setDate(incomeDto.getDate() != null ? incomeDto.getDate() : LocalDate.now());
        income.setStatus(incomeDto.getStatus() != null ? incomeDto.getStatus() : "Received");
        income.setNotes(incomeDto.getNotes());

        Income saved = incomeRepository.save(income);
        return mapToDto(saved);
    }

    public CreateIncomeCheckoutResponse createIncomeCheckout(CreateIncomeCheckoutRequest request) {
        validateSecretKey();
        validateIncomeRequest(request);

        User user = userRepository.findById(request.getUserId())
                .orElseThrow(() -> new RuntimeException("User not found"));

        Income income = new Income();
        income.setUser(user);
        income.setSourceName(request.getSourceName().trim());
        income.setCategory(request.getCategory());
        income.setAmount(request.getAmount());
        income.setDate(request.getDate() != null ? request.getDate() : LocalDate.now());
        income.setStatus("Pending");
        income.setNotes(request.getNotes());
        income.setPaymentProvider("PayMongo");
        income = incomeRepository.save(income);

        try {
            int amountInCentavos = request.getAmount().multiply(BigDecimal.valueOf(100)).intValueExact();
            String successUrl = frontendBaseUrl + "/success?flow=income&incomeId=" + income.getId();
            String cancelUrl = frontendBaseUrl + "/income?payment=cancelled";

            ObjectNode billingNode = objectMapper.createObjectNode()
                    .put("name", user.getName() == null ? "MoneyMap User" : user.getName())
                    .put("email", user.getEmail());

            ObjectNode lineItemNode = objectMapper.createObjectNode()
                    .put("currency", "PHP")
                    .put("amount", amountInCentavos)
                    .put("name", request.getSourceName().trim())
                    .put("quantity", 1);

            ArrayNode lineItemsNode = objectMapper.createArrayNode().add(lineItemNode);
            ArrayNode paymentMethodsNode = objectMapper.createArrayNode().add("gcash").add("card");

            ObjectNode attributesNode = objectMapper.createObjectNode();
            attributesNode.set("billing", billingNode);
            attributesNode.set("line_items", lineItemsNode);
            attributesNode.set("payment_method_types", paymentMethodsNode);
            attributesNode.put("success_url", successUrl);
            attributesNode.put("cancel_url", cancelUrl);

            ObjectNode dataNode = objectMapper.createObjectNode();
            dataNode.set("attributes", attributesNode);

            ObjectNode payload = objectMapper.createObjectNode();
            payload.set("data", dataNode);

            HttpRequest httpRequest = HttpRequest.newBuilder()
                    .uri(URI.create(PAYMONGO_CHECKOUT_URL))
                    .header("accept", "application/json")
                    .header("content-type", "application/json")
                    .header("authorization", buildBasicAuthHeader())
                    .POST(HttpRequest.BodyPublishers.ofString(objectMapper.writeValueAsString(payload)))
                    .build();

            HttpResponse<String> response = httpClient.send(httpRequest, HttpResponse.BodyHandlers.ofString());
            ensureSuccessResponse(response, "Failed to create PayMongo checkout session.");

            JsonNode root = objectMapper.readTree(response.body());
            JsonNode data = root.path("data");
            String checkoutUrl = data.path("attributes").path("checkout_url").asText();
            String checkoutSessionId = data.path("id").asText();

            income.setCheckoutUrl(checkoutUrl);
            income.setCheckoutSessionId(checkoutSessionId);
            incomeRepository.save(income);

            return new CreateIncomeCheckoutResponse(income.getId(), checkoutUrl);
        } catch (InterruptedException ex) {
            income.setStatus("Failed");
            incomeRepository.save(income);
            Thread.currentThread().interrupt();
            throw new RuntimeException("Unable to create PayMongo checkout session.", ex);
        } catch (IOException | RuntimeException ex) {
            income.setStatus("Failed");
            incomeRepository.save(income);
            throw new RuntimeException(resolveCheckoutErrorMessage(ex), ex);
        }
    }

    public IncomeSuccessResponse confirmIncomeSuccess(IncomeSuccessRequest request) {
        validateSecretKey();

        Income income = incomeRepository.findById(request.getIncomeId())
                .orElseThrow(() -> new RuntimeException("Income record not found."));

        if ("Received".equalsIgnoreCase(income.getStatus())) {
            return new IncomeSuccessResponse(income.getId(), income.getStatus(), income.getAmount(), "Income already confirmed.");
        }

        if (income.getCheckoutSessionId() == null || income.getCheckoutSessionId().isBlank()) {
            throw new IllegalStateException("Income checkout session is missing.");
        }

        try {
            HttpRequest httpRequest = HttpRequest.newBuilder()
                    .uri(URI.create(PAYMONGO_CHECKOUT_URL + "/" + income.getCheckoutSessionId()))
                    .header("accept", "application/json")
                    .header("authorization", buildBasicAuthHeader())
                    .GET()
                    .build();

            HttpResponse<String> response = httpClient.send(httpRequest, HttpResponse.BodyHandlers.ofString());
            ensureSuccessResponse(response, "Failed to verify PayMongo checkout session.");

            JsonNode root = objectMapper.readTree(response.body());
            if (!isCheckoutPaid(root)) {
                return new IncomeSuccessResponse(income.getId(), income.getStatus(), income.getAmount(), "Income payment is still pending.");
            }

            income.setStatus("Received");
            if (income.getDate() == null) {
                income.setDate(LocalDate.now());
            }
            incomeRepository.save(income);

            notificationRepository.save(buildIncomeNotification(income));

            return new IncomeSuccessResponse(income.getId(), income.getStatus(), income.getAmount(), "Income recorded successfully.");
        } catch (InterruptedException ex) {
            Thread.currentThread().interrupt();
            throw new RuntimeException("Unable to verify PayMongo payment.", ex);
        } catch (IOException ex) {
            throw new RuntimeException("Unable to verify PayMongo payment.", ex);
        }
    }

    public IncomeDto updateIncome(Long id, IncomeDto incomeDto) {
        Income income = incomeRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Income not found"));

        if (!income.getUser().getId().equals(incomeDto.getUserId())) {
            throw new RuntimeException("Income does not belong to user");
        }

        income.setSourceName(incomeDto.getSourceName());
        income.setCategory(incomeDto.getCategory());
        income.setAmount(incomeDto.getAmount());
        income.setDate(incomeDto.getDate() != null ? incomeDto.getDate() : LocalDate.now());
        income.setStatus(incomeDto.getStatus() != null ? incomeDto.getStatus() : "Received");
        income.setNotes(incomeDto.getNotes());

        Income saved = incomeRepository.save(income);
        return mapToDto(saved);
    }

    public void deleteIncome(Long id) {
        incomeRepository.deleteById(id);
    }

    private void validateIncomeRequest(CreateIncomeCheckoutRequest request) {
        if (request.getUserId() == null) {
            throw new IllegalArgumentException("User is required.");
        }
        if (request.getSourceName() == null || request.getSourceName().isBlank()) {
            throw new IllegalArgumentException("Source name is required.");
        }
        if (request.getAmount() == null || request.getAmount().compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalArgumentException("Amount must be greater than zero.");
        }
    }

    private void validateSecretKey() {
        if (payMongoSecretKey == null || payMongoSecretKey.isBlank()) {
            throw new IllegalStateException("PAYMONGO_SECRET_KEY is not configured.");
        }
        String normalizedKey = payMongoSecretKey.trim();
        boolean hasValidPrefix = normalizedKey.startsWith("sk_test_") || normalizedKey.startsWith("sk_live_");
        if (!hasValidPrefix || normalizedKey.length() <= "sk_test_".length()) {
            throw new IllegalStateException(
                "PAYMONGO_SECRET_KEY is invalid. Use the full server-side secret key from the PayMongo dashboard, starting with sk_test_ or sk_live_."
            );
        }
    }

    private String buildBasicAuthHeader() {
        String credentials = payMongoSecretKey.trim() + ":";
        String encoded = Base64.getEncoder().encodeToString(credentials.getBytes(StandardCharsets.UTF_8));
        return "Basic " + encoded;
    }

    private void ensureSuccessResponse(HttpResponse<String> response, String message) {
        if (response.statusCode() < 200 || response.statusCode() >= 300) {
            throw new RuntimeException(message + " " + response.body());
        }
    }

    private String resolveCheckoutErrorMessage(Exception ex) {
        if (ex.getMessage() != null && !ex.getMessage().isBlank()) {
            return ex.getMessage();
        }
        Throwable cause = ex.getCause();
        if (cause != null && cause.getMessage() != null && !cause.getMessage().isBlank()) {
            return cause.getMessage();
        }
        return "Unable to create PayMongo checkout session.";
    }

    private boolean isCheckoutPaid(JsonNode root) {
        JsonNode attributes = root.path("data").path("attributes");
        String checkoutStatus = attributes.path("status").asText("");
        if ("paid".equalsIgnoreCase(checkoutStatus) || "succeeded".equalsIgnoreCase(checkoutStatus)) {
            return true;
        }

        String paymentIntentStatus = attributes.path("payment_intent").path("attributes").path("status").asText("");
        if ("succeeded".equalsIgnoreCase(paymentIntentStatus) || "paid".equalsIgnoreCase(paymentIntentStatus)) {
            return true;
        }

        JsonNode payments = attributes.path("payments");
        if (payments.isArray()) {
            for (JsonNode payment : payments) {
                String status = payment.path("attributes").path("status").asText("");
                if ("paid".equalsIgnoreCase(status) || "succeeded".equalsIgnoreCase(status)) {
                    return true;
                }
            }
        }

        return false;
    }

    private Notification buildIncomeNotification(Income income) {
        Notification notification = new Notification();
        notification.setUser(income.getUser());
        notification.setTitle("Income Received");
        notification.setBody("Your " + income.getSourceName() + " income of $" + income.getAmount().toPlainString() + " has been recorded.");
        notification.setType("Info");
        notification.setIcon("$");
        return notification;
    }

    private IncomeDto mapToDto(Income income) {
        IncomeDto dto = new IncomeDto();
        dto.setId(income.getId());
        dto.setUserId(income.getUser().getId());
        dto.setSourceName(income.getSourceName());
        dto.setCategory(income.getCategory());
        dto.setAmount(income.getAmount());
        dto.setDate(income.getDate());
        dto.setStatus(income.getStatus());
        dto.setNotes(income.getNotes());
        dto.setCheckoutUrl(income.getCheckoutUrl());
        return dto;
    }
}
