package com.chatapp.controller;

import com.chatapp.model.User;
import com.chatapp.repository.UserRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserRepository userRepository;

    public UserController(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    /**
     * GET /api/users/search?q=alice
     * Returns users whose username or displayName contains the query (case-insensitive).
     * Excludes the calling user from results.
     */
    @GetMapping("/search")
    public ResponseEntity<List<Map<String, String>>> searchUsers(
            @RequestParam(defaultValue = "") String q,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        String lq = q.toLowerCase();

        List<Map<String, String>> results = userRepository.findAll().stream()
                .filter(u -> !u.getUsername().equals(userDetails.getUsername()))
                .filter(u ->
                        u.getUsername().toLowerCase().contains(lq) ||
                        (u.getDisplayName() != null && u.getDisplayName().toLowerCase().contains(lq))
                )
                .limit(20)
                .map(u -> Map.of(
                        "id",          u.getId(),
                        "username",    u.getUsername(),
                        "displayName", u.getDisplayName() != null ? u.getDisplayName() : u.getUsername(),
                        "avatarColor", u.getAvatarColor() != null ? u.getAvatarColor() : "#7C3AED",
                        "online",      String.valueOf(u.isOnline())
                ))
                .collect(Collectors.toList());

        return ResponseEntity.ok(results);
    }
}
