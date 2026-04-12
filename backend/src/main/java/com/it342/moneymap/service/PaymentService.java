package com.it342.moneymap.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.it342.moneymap.dto.CreateCheckoutRequest;
import com.it342.moneymap.dto.CreateCheckoutResponse;
import com.it342.moneymap.dto.PaymentSuccessRequest;
import com.it342.moneymap.dto.PaymentSuccessResponse;
import com.it342.moneymap.entity.Contribution;
import com.it342.moneymap.entity.Goal;
import com.it342.moneymap.entity.Notification;
import com.it342.moneymap.entity.Payment;
import com.it342.moneymap.entity.User;
import com.it342.moneymap.repository.ContributionRepository;
import com.it342.moneymap.repository.GoalRepository;
import com.it342.moneymap.repository.NotificationRepository;
import com.it342.moneymap.repository.PaymentRepository;
import com.it342.moneymap.repository.UserRepository;
import java.io.IOException;
import java.math.BigDecimal;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.time.LocalDate;
import java.util.Base64;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
public class PaymentService {

    private static final String PAYMONGO_CHECKOUT_URL = "https://api.paymongo.com/v1/checkout_sessions";

    @Autowired
    private PaymentRepository paymentRepository;

    @Autowired
    private GoalRepository goalRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ContributionRepository contributionRepository;

    @Autowired
    private NotificationRepository notificationRepository;

    @Autowired
    private ObjectMapper objectMapper;

    @Value("${app.paymongo.secret-key:}")
    private String payMongoSecretKey;

    @Value("${app.frontend.base-url:http://localhost:3000}")
    private String frontendBaseUrl;

    private final HttpClient httpClient = HttpClient.newHttpClient();

    public CreateCheckoutResponse createCheckout(CreateCheckoutRequest request) {
        validateSecretKey();

        if (request.getAmount() == null || request.getAmount().compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalArgumentException("Amount must be greater than zero.");
        }

        Goal goal = goalRepository.findById(request.getGoalId())
            .orElseThrow(() -> new RuntimeException("Savings goal not found."));

        User user = userRepository.findById(request.getUserId())
            .orElseThrow(() -> new RuntimeException("User not found."));

        if (!goal.getUser().getId().equals(user.getId())) {
            throw new IllegalArgumentException("Goal does not belong to the user.");
        }

        validateGoalCapacity(goal, request.getAmount());

        Payment payment = new Payment();
        payment.setAmount(request.getAmount());
        payment.setStatus("PENDING");
        payment.setUser(user);
        payment.setSavingsGoal(goal);
        payment = paymentRepository.save(payment);

        try {
            int amountInCentavos = request.getAmount().multiply(BigDecimal.valueOf(100)).intValueExact();
            String successUrl = frontendBaseUrl + "/success?paymentId=" + payment.getId();
            String cancelUrl = frontendBaseUrl + "/contributions?payment=cancelled";

            ObjectNode billingNode = objectMapper.createObjectNode()
                .put("name", user.getName() == null ? "MoneyMap User" : user.getName())
                .put("email", user.getEmail());

            ObjectNode lineItemNode = objectMapper.createObjectNode()
                .put("currency", "PHP")
                .put("amount", amountInCentavos)
                .put("name", goal.getName())
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

            payment.setCheckoutUrl(checkoutUrl);
            payment.setCheckoutSessionId(checkoutSessionId);
            paymentRepository.save(payment);

            return new CreateCheckoutResponse(payment.getId(), checkoutUrl);
        } catch (InterruptedException ex) {
            payment.setStatus("FAILED");
            paymentRepository.save(payment);
            Thread.currentThread().interrupt();
            throw new RuntimeException("Unable to create PayMongo checkout session.", ex);
        } catch (IOException | RuntimeException ex) {
            payment.setStatus("FAILED");
            paymentRepository.save(payment);
            throw new RuntimeException(resolveCheckoutErrorMessage(ex), ex);
        }
    }

    public PaymentSuccessResponse confirmSuccess(PaymentSuccessRequest request) {
        validateSecretKey();

        Payment payment = paymentRepository.findById(request.getPaymentId())
            .orElseThrow(() -> new RuntimeException("Payment not found."));

        if ("SUCCESS".equalsIgnoreCase(payment.getStatus())) {
            return new PaymentSuccessResponse(
                payment.getId(),
                payment.getStatus(),
                payment.getSavingsGoal().getCurrentAmount(),
                "Payment already confirmed."
            );
        }

        try {
            HttpRequest httpRequest = HttpRequest.newBuilder()
                .uri(URI.create(PAYMONGO_CHECKOUT_URL + "/" + payment.getCheckoutSessionId()))
                .header("accept", "application/json")
                .header("authorization", buildBasicAuthHeader())
                .GET()
                .build();

            HttpResponse<String> response = httpClient.send(httpRequest, HttpResponse.BodyHandlers.ofString());
            ensureSuccessResponse(response, "Failed to verify PayMongo checkout session.");

            JsonNode root = objectMapper.readTree(response.body());
            if (!isCheckoutPaid(root)) {
                return new PaymentSuccessResponse(
                    payment.getId(),
                    payment.getStatus(),
                    payment.getSavingsGoal().getCurrentAmount(),
                    "Payment is still pending."
                );
            }

            Goal goal = payment.getSavingsGoal();
            BigDecimal oldAmount = goal.getCurrentAmount();
            BigDecimal remainingAmount = goal.getTargetAmount().subtract(oldAmount);
            if (remainingAmount.compareTo(BigDecimal.ZERO) <= 0) {
                payment.setStatus("FAILED");
                paymentRepository.save(payment);
                throw new IllegalStateException("This goal is already complete.");
            }
            if (payment.getAmount().compareTo(remainingAmount) > 0) {
                payment.setStatus("FAILED");
                paymentRepository.save(payment);
                throw new IllegalStateException("Payment exceeds the remaining goal amount.");
            }

            BigDecimal updatedAmount = oldAmount.add(payment.getAmount());
            goal.setCurrentAmount(updatedAmount);
            goalRepository.save(goal);

            Contribution contribution = new Contribution();
            contribution.setUser(payment.getUser());
            contribution.setGoal(goal);
            contribution.setAmount(payment.getAmount());
            contribution.setDate(LocalDate.now());
            contribution.setMethod("PayMongo Checkout");
            contribution.setStatus("Success");
            contributionRepository.save(contribution);

            if (oldAmount.compareTo(goal.getTargetAmount()) < 0 && updatedAmount.compareTo(goal.getTargetAmount()) >= 0) {
                notificationRepository.save(buildGoalCompletedNotification(payment.getUser(), goal));
            }

            payment.setStatus("SUCCESS");
            paymentRepository.save(payment);

            return new PaymentSuccessResponse(
                payment.getId(),
                payment.getStatus(),
                updatedAmount,
                "Payment confirmed successfully."
            );
        } catch (InterruptedException ex) {
            Thread.currentThread().interrupt();
            throw new RuntimeException("Unable to verify PayMongo payment.", ex);
        } catch (IOException ex) {
            throw new RuntimeException("Unable to verify PayMongo payment.", ex);
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

    private void validateGoalCapacity(Goal goal, BigDecimal amount) {
        BigDecimal currentAmount = goal.getCurrentAmount();
        BigDecimal remainingAmount = goal.getTargetAmount().subtract(currentAmount);
        if (remainingAmount.compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalArgumentException("This goal is already complete.");
        }
        if (amount.compareTo(remainingAmount) > 0) {
            throw new IllegalArgumentException("Payment exceeds the remaining goal amount.");
        }
    }

    private Notification buildGoalCompletedNotification(User user, Goal goal) {
        Notification notification = new Notification();
        notification.setUser(user);
        notification.setTitle(goal.getIcon() + " Goal Completed");
        notification.setBody("You fully funded " + goal.getName() + " and reached your $" + goal.getTargetAmount().toPlainString() + " target.");
        notification.setType("Milestone");
        notification.setIcon(goal.getIcon());
        return notification;
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
}
