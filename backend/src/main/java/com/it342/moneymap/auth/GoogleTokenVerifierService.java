package com.it342.moneymap.auth;

import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdTokenVerifier;
import com.google.api.client.googleapis.javanet.GoogleNetHttpTransport;
import com.google.api.client.json.gson.GsonFactory;
import java.security.GeneralSecurityException;
import java.util.Collections;
import java.util.Objects;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
public class GoogleTokenVerifierService {

    private final String googleClientId;
    private final GoogleIdTokenVerifier verifier;

    public GoogleTokenVerifierService(
        @Value("${app.oauth.google.client-id:}") String googleClientId
    ) throws GeneralSecurityException, java.io.IOException {
        this.googleClientId = googleClientId;
        this.verifier = new GoogleIdTokenVerifier.Builder(
            GoogleNetHttpTransport.newTrustedTransport(),
            GsonFactory.getDefaultInstance()
        )
            .setAudience(Collections.singletonList(googleClientId))
            .build();
    }

    public GoogleIdToken.Payload verify(String idToken) {
        if (googleClientId == null || googleClientId.isBlank()) {
            throw new IllegalStateException("Google OAuth client ID is not configured.");
        }

        if (idToken == null || idToken.isBlank()) {
            throw new IllegalArgumentException("Google ID token is required.");
        }

        try {
            GoogleIdToken googleIdToken = verifier.verify(idToken);
            if (googleIdToken == null) {
                throw new IllegalArgumentException("Invalid Google ID token.");
            }

            GoogleIdToken.Payload payload = googleIdToken.getPayload();
            if (!Boolean.TRUE.equals(payload.getEmailVerified())) {
                throw new IllegalArgumentException("Google account email is not verified.");
            }

            return payload;
        } catch (GeneralSecurityException | java.io.IOException ex) {
            throw new IllegalStateException("Failed to verify Google ID token.", ex);
        }
    }
}
