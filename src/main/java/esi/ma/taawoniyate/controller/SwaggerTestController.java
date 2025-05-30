package esi.ma.taawoniyate.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/test")
@CrossOrigin(origins = {"http://localhost:8081", "http://localhost:8083"}, allowCredentials = "true")
@Tag(name = "Test API", description = "Test endpoints for Swagger documentation")
public class SwaggerTestController {

    @Operation(
        summary = "Health check",
        description = "Simple health check endpoint to test API connectivity"
    )
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "API is working"),
        @ApiResponse(responseCode = "500", description = "Internal server error")
    })
    @GetMapping("/health")
    public ResponseEntity<Map<String, Object>> healthCheck() {
        Map<String, Object> response = new HashMap<>();
        response.put("status", "OK");
        response.put("message", "Taawoniyate API is running");
        response.put("timestamp", System.currentTimeMillis());
        return ResponseEntity.ok(response);
    }

    @Operation(
        summary = "API Information",
        description = "Get information about the Taawoniyate API"
    )
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "API information retrieved successfully")
    })
    @GetMapping("/info")
    public ResponseEntity<Map<String, Object>> apiInfo() {
        Map<String, Object> response = new HashMap<>();
        response.put("name", "Taawoniyate API");
        response.put("version", "1.0.0");
        response.put("description", "Marketplace API for clients and sellers");
        response.put("documentation", "/swagger-ui.html");
        return ResponseEntity.ok(response);
    }
}
