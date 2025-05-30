package esi.ma.taawoniyate.controller;

import java.util.ArrayList;
import java.util.Enumeration;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import esi.ma.taawoniyate.model.Client;
import esi.ma.taawoniyate.model.Panier;
import esi.ma.taawoniyate.model.Product;
import esi.ma.taawoniyate.model.Seller;
import esi.ma.taawoniyate.model.User;
import esi.ma.taawoniyate.repository.UserRepository;
import esi.ma.taawoniyate.service.PanierService;
import esi.ma.taawoniyate.service.UserService;
import esi.ma.taawoniyate.security.JwtUtil;
import jakarta.servlet.ServletContext;
import jakarta.servlet.http.HttpSession;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.security.crypto.password.PasswordEncoder;

@RestController
@RequestMapping("/api/users")
@CrossOrigin(origins = "http://localhost:8081",allowCredentials = "true")
@Tag(name = "User Management", description = "APIs for user authentication, registration, and profile management")
public class UserController {

    @Autowired
    private UserService userService;
    @Autowired
    private UserRepository userRepository;
    @Autowired
    private PanierService panierService;
    @Autowired
    private JwtUtil jwtUtil;
    @Autowired
    private PasswordEncoder passwordEncoder;

    public static HttpSession session  = new HttpSession() {
        @Override
        public long getCreationTime() {
            return 0;
        }

        @Override
        public String getId() {
            return "";
        }

        @Override
        public long getLastAccessedTime() {
            return 0;
        }

        @Override
        public ServletContext getServletContext() {
            return null;
        }

        @Override
        public void setMaxInactiveInterval(int i) {

        }

        @Override
        public int getMaxInactiveInterval() {
            return 0;
        }

        @Override
        public Object getAttribute(String s) {
            return null;
        }

        @Override
        public Enumeration<String> getAttributeNames() {
            return null;
        }

        @Override
        public void setAttribute(String s, Object o) {

        }

        @Override
        public void removeAttribute(String s) {

        }

        @Override
        public void invalidate() {

        }

        @Override
        public boolean isNew() {
            return false;
        }
    };


    public HttpSession getSession() {
        return session;
    }

    @GetMapping
    public ResponseEntity<Page<User>> getAllUsers(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "id") String sortBy,
            @RequestParam(defaultValue = "asc") String sortDir) {

        Sort sort = sortDir.equalsIgnoreCase("desc") ?
                Sort.by(sortBy).descending() :
                Sort.by(sortBy).ascending();

        Pageable pageable = PageRequest.of(page, size, sort);
        Page<User> users = userService.findAll(pageable);

        return ResponseEntity.ok(users);
    }

    @GetMapping("/email/{email}")
    public ResponseEntity<User> getUserByEmail(@PathVariable String email) {
        User user = userService.findByEmail(email);
        return user != null ?
                ResponseEntity.ok(user) :
                ResponseEntity.notFound().build();
    }

    @GetMapping("/{id}")
    public ResponseEntity<User> getUserById(@PathVariable long id) {
        User user = userService.findById(id);
        return user != null ?
                ResponseEntity.ok(user) :
                ResponseEntity.notFound().build();
    }

    @GetMapping("/fullname/{fullName}")
    public ResponseEntity<User> getUserByFullName(@PathVariable String fullName) {
        User user = userService.findByFullName(fullName);
        return user != null ?
                ResponseEntity.ok(user) :
                ResponseEntity.notFound().build();
    }

    @GetMapping("/city/{city}")
    public ResponseEntity<List<User>> getUsersByCity(@PathVariable String city) {
        List<User> users = userService.findByCity(city);
        return ResponseEntity.ok(users);
    }

    @GetMapping("/region/{region}")
    public ResponseEntity<List<User>> getUsersByRegion(@PathVariable String region) {
        List<User> users = userService.findByRegion(region);
        return ResponseEntity.ok(users);
    }

    @GetMapping("/exists/email/{email}")
    public ResponseEntity<Boolean> checkEmailExists(@PathVariable String email) {
        boolean exists = userService.existsByEmail(email);
        return ResponseEntity.ok(exists);
    }

    // Debug endpoint to check users in database
    @GetMapping("/debug/users")
    public ResponseEntity<Map<String, Object>> debugUsers() {
        Map<String, Object> response = new HashMap<>();
        try {
            List<User> allUsers = userRepository.findAll();
            response.put("success", true);
            response.put("totalUsers", allUsers.size());
            response.put("users", allUsers.stream().map(user -> {
                Map<String, Object> userInfo = new HashMap<>();
                userInfo.put("id", user.getId());
                userInfo.put("email", user.getEmail());
                userInfo.put("fullName", user.getFullName());
                userInfo.put("role", user.getRole());
                userInfo.put("passwordLength", user.getPassword() != null ? user.getPassword().length() : 0);
                return userInfo;
            }).toList());
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            response.put("success", false);
            response.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    @Operation(
        summary = "Authenticate user",
        description = "Authenticate user with email and password, returns JWT token"
    )
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Authentication successful"),
        @ApiResponse(responseCode = "401", description = "Invalid credentials"),
        @ApiResponse(responseCode = "500", description = "Internal server error")
    })
    @PostMapping("/authenticate")
    public ResponseEntity<Map<String, Object>> authenticateUser(@RequestBody AuthRequest authRequest) {
        Map<String, Object> response = new HashMap<>();

        try {
            System.out.println("=== AUTHENTICATION DEBUG ===");
            System.out.println("Email: " + authRequest.getEmail());
            System.out.println("Password: " + authRequest.getPassword());

            // Find user by email
            User user = userService.findByEmail(authRequest.getEmail());
            System.out.println("User found: " + (user != null));

            if (user != null) {
                System.out.println("User ID: " + user.getId());
                System.out.println("User Email: " + user.getEmail());
                System.out.println("User Role: " + user.getRole());
                System.out.println("Stored Password: " + user.getPassword());
            }

            // Temporary: Check both hashed and plain text passwords for backward compatibility
            boolean passwordMatches = false;
            if (user != null) {
                // Try plain text comparison first (for existing users)
                passwordMatches = authRequest.getPassword().equals(user.getPassword());
                System.out.println("Plain text password match: " + passwordMatches);

                if (!passwordMatches) {
                    // Try hashed password
                    try {
                        passwordMatches = passwordEncoder.matches(authRequest.getPassword(), user.getPassword());
                        System.out.println("Hashed password match: " + passwordMatches);
                    } catch (Exception e) {
                        System.out.println("Password hashing error: " + e.getMessage());
                    }
                }
            }

            if (user != null && passwordMatches) {
                // Generate JWT token
                String token = jwtUtil.generateToken(user.getEmail(), user.getRole(), user.getId());

                response.put("success", true);
                response.put("message", "Authentication successful");
                response.put("user", user);
                response.put("token", token);

                return ResponseEntity.ok(response);
            } else {
                response.put("success", false);
                response.put("message", "Invalid email or password");
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response);
            }
        } catch (Exception e) {
            System.out.println("Authentication exception: " + e.getMessage());
            e.printStackTrace();
            response.put("success", false);
            response.put("message", "Authentication failed: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }
    @Operation(
        summary = "Get current user",
        description = "Get current authenticated user information",
        security = @SecurityRequirement(name = "Bearer Authentication")
    )
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "User information retrieved successfully"),
        @ApiResponse(responseCode = "401", description = "User not authenticated"),
        @ApiResponse(responseCode = "500", description = "Internal server error")
    })
    @GetMapping("/me")
    public ResponseEntity<User> getCurrentUser(HttpServletRequest request) {
        try {
            Long userId = (Long) request.getAttribute("userId");
            if (userId != null) {
                User user = userService.findById(userId);
                if (user != null) {
                    return ResponseEntity.ok(user);
                }
            }
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    // Get current seller's products
    @GetMapping("/seller/products")
    public ResponseEntity<?> getSellerProducts() {
        User currentUser = (User) session.getAttribute("user");
        if (currentUser == null) {
            return ResponseEntity.status(401).body("User not logged in");
        }

        if (!"seller".equalsIgnoreCase(currentUser.getRole())) {
            return ResponseEntity.status(403).body("Access denied. Only sellers can access this endpoint.");
        }

        try {
            Seller seller = (Seller) currentUser;
            List<Product> products = seller.getProducts();
            return ResponseEntity.ok(products != null ? products : new ArrayList<>());
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Error fetching seller products: " + e.getMessage());
        }
    }

    // Get current client's order history (panier history)
    @GetMapping("/client/orders")
    public ResponseEntity<?> getClientOrders() {
        User currentUser = (User) session.getAttribute("user");
        if (currentUser == null) {
            return ResponseEntity.status(401).body("User not logged in");
        }

        if (!"client".equalsIgnoreCase(currentUser.getRole())) {
            return ResponseEntity.status(403).body("Access denied. Only clients can access this endpoint.");
        }

        try {
            Client client = (Client) currentUser;
            List<Panier> orders = panierService.getAllPanierByClient(client);
            return ResponseEntity.ok(orders != null ? orders : new ArrayList<>());
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Error fetching client orders: " + e.getMessage());
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteUser(@PathVariable Integer id) {
        try {
            userService.deleteById(id);
            return ResponseEntity.noContent().build();
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }

    @Operation(
        summary = "Register new client",
        description = "Register a new client user with personal information. All fields are required except address details which will default to 'Not specified' if not provided."
    )
    @ApiResponses(value = {
        @ApiResponse(responseCode = "201", description = "Client registered successfully"),
        @ApiResponse(responseCode = "400", description = "Invalid input data or missing required fields"),
        @ApiResponse(responseCode = "409", description = "Email already exists"),
        @ApiResponse(responseCode = "500", description = "Internal server error")
    })
    @PostMapping("/register/client")
    public ResponseEntity<Map<String, Object>> registerClient(
        @Parameter(description = "Client registration data", required = true)
        @RequestBody Client client) {
        Map<String, Object> response = new HashMap<>();

        try {
            // Validate required fields
            if (client.getEmail() == null || client.getEmail().trim().isEmpty() ||
                client.getPassword() == null || client.getPassword().trim().isEmpty() ||
                client.getFullName() == null || client.getFullName().trim().isEmpty()) {
                response.put("success", false);
                response.put("message", "Email, password, and full name are required");
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
            }

            // Check if email already exists
            if (userService.existsByEmail(client.getEmail())) {
                response.put("success", false);
                response.put("message", "Email already exists");
                return ResponseEntity.status(HttpStatus.CONFLICT).body(response);
            }

            // Set default values for fields that cannot be null
            if (client.getCity() == null) client.setCity("Not specified");
            if (client.getRegion() == null) client.setRegion("Not specified");
            if (client.getAddress() == null) client.setAddress("Not specified");
            if (client.getPhone() == null) client.setPhone("Not specified");

            // Ensure role is set
            client.setRole("client");

            // Hash the password
            client.setPassword(passwordEncoder.encode(client.getPassword()));

            // Initialize empty lists
            client.setProduitFavoris(new ArrayList<>());

            // Save the client
            Client registeredClient = (Client) userService.save(client);

            response.put("success", true);
            response.put("message", "Client registered successfully");
            response.put("user", registeredClient);
            return ResponseEntity.status(HttpStatus.CREATED).body(response);

        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Registration failed: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    @Operation(
        summary = "Register new seller",
        description = "Register a new seller user with business information. Business name is required in addition to personal details."
    )
    @ApiResponses(value = {
        @ApiResponse(responseCode = "201", description = "Seller registered successfully"),
        @ApiResponse(responseCode = "400", description = "Invalid input data or missing required fields"),
        @ApiResponse(responseCode = "409", description = "Email already exists"),
        @ApiResponse(responseCode = "500", description = "Internal server error")
    })
    @PostMapping("/register/seller")
    public ResponseEntity<Map<String, Object>> registerSeller(
        @Parameter(description = "Seller registration data including business information", required = true)
        @RequestBody Seller seller) {
        Map<String, Object> response = new HashMap<>();

        try {
            // Validate required fields
            if (seller.getEmail() == null || seller.getEmail().trim().isEmpty() ||
                seller.getPassword() == null || seller.getPassword().trim().isEmpty() ||
                seller.getFullName() == null || seller.getFullName().trim().isEmpty() ||
                seller.getBusinessName() == null || seller.getBusinessName().trim().isEmpty()) {
                response.put("success", false);
                response.put("message", "Email, password, full name, and business name are required");
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
            }

            // Check if email already exists
            if (userService.existsByEmail(seller.getEmail())) {
                response.put("success", false);
                response.put("message", "Email already exists");
                return ResponseEntity.status(HttpStatus.CONFLICT).body(response);
            }

            // Set default values for fields that cannot be null
            if (seller.getCity() == null) seller.setCity("Not specified");
            if (seller.getRegion() == null) seller.setRegion("Not specified");
            if (seller.getAddress() == null) seller.setAddress("Not specified");
            if (seller.getPhone() == null) seller.setPhone("Not specified");

            // Ensure role is set
            seller.setRole("seller");

            // Hash the password
            seller.setPassword(passwordEncoder.encode(seller.getPassword()));

            // Initialize empty lists
            seller.setProduitFavoris(new ArrayList<>());
            seller.setProducts(new ArrayList<>());

            // Save the seller
            Seller registeredSeller = (Seller) userService.save(seller);

            response.put("success", true);
            response.put("message", "Seller registered successfully");
            response.put("user", registeredSeller);
            return ResponseEntity.status(HttpStatus.CREATED).body(response);

        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Registration failed: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }

    }
    @GetMapping("/me/favorites")
    public ResponseEntity<Map<String, Object>> getFavoriteProducts() {
        Map<String, Object> response = new HashMap<>();

        // Get the authenticated user from the session
        User user = (User) session.getAttribute("user");
        if (user == null || !(user instanceof Client)) {
            response.put("success", false);
            response.put("message", "User not authenticated or not a client");
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response);
        }

        Client client = (Client) user;
        List<Product> favorites = client.getProduitFavoris() != null ? client.getProduitFavoris() : new ArrayList<>();

        response.put("success", true);
        response.put("message", "Favorite products retrieved successfully");
        response.put("favorites", favorites);
        return ResponseEntity.ok(response);
    }

    // Inner class for authentication request
    public static class AuthRequest {
        private String email;
        private String password;

        public AuthRequest() {}

        public AuthRequest(String email, String password) {
            this.email = email;
            this.password = password;
        }

        public String getEmail() {
            return email;
        }

        public void setEmail(String email) {
            this.email = email;
        }

        public String getPassword() {
            return password;
        }

        public void setPassword(String password) {
            this.password = password;
        }
    }

    @Operation(
        summary = "Update user information",
        description = "Update current user's personal information including contact details and address. Requires JWT authentication.",
        security = @SecurityRequirement(name = "Bearer Authentication")
    )
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "User information updated successfully"),
        @ApiResponse(responseCode = "401", description = "User not authenticated"),
        @ApiResponse(responseCode = "400", description = "Invalid input data"),
        @ApiResponse(responseCode = "500", description = "Internal server error")
    })
    @PostMapping("/update-info")
    public ResponseEntity<?> updateUserInfo(
        @Parameter(description = "User information to update", required = true)
        @RequestBody Map<String, String> userInfo,
        HttpServletRequest request) {
        try {
            System.out.println("=== UPDATE USER INFO ENDPOINT CALLED ===");

            // Get authenticated user from JWT
            Long userId = (Long) request.getAttribute("userId");

            if (userId == null) {
                return ResponseEntity.status(401).body("User not authenticated");
            }

            System.out.println("Updating info for user ID: " + userId);

            // Find the user
            User user = userService.findById(userId);
            if (user == null) {
                return ResponseEntity.status(404).body("User not found");
            }

            // Update user information
            if (userInfo.containsKey("fullName")) {
                user.setFullName(userInfo.get("fullName"));
            }
            if (userInfo.containsKey("email")) {
                user.setEmail(userInfo.get("email"));
            }
            if (userInfo.containsKey("phone")) {
                user.setPhone(userInfo.get("phone"));
            }
            if (userInfo.containsKey("address")) {
                user.setAddress(userInfo.get("address"));
            }
            if (userInfo.containsKey("city")) {
                user.setCity(userInfo.get("city"));
            }
            if (userInfo.containsKey("region")) {
                user.setRegion(userInfo.get("region"));
            }

            // Save the updated user
            User updatedUser = userService.save(user);

            System.out.println("User information updated successfully for: " + updatedUser.getFullName());

            return ResponseEntity.ok("User information updated successfully");

        } catch (Exception e) {
            System.out.println("Error in updateUserInfo: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(500).body("Error updating user information: " + e.getMessage());
        }
    }

    // JWT-authenticated endpoint for getting seller products
    @GetMapping("/seller/products-jwt")
    public ResponseEntity<?> getSellerProductsJWT(HttpServletRequest request) {
        try {
            System.out.println("=== GET SELLER PRODUCTS JWT ENDPOINT CALLED ===");

            // Get authenticated user from JWT
            Long userId = (Long) request.getAttribute("userId");
            String userRole = (String) request.getAttribute("userRole");

            if (userId == null) {
                return ResponseEntity.status(401).body("User not authenticated");
            }

            if (!"seller".equalsIgnoreCase(userRole)) {
                return ResponseEntity.status(403).body("Access denied. Only sellers can access this endpoint.");
            }

            // Get the seller
            User currentUser = userService.findById(userId);
            if (currentUser == null || !(currentUser instanceof Seller)) {
                return ResponseEntity.status(404).body("Seller not found");
            }

            Seller seller = (Seller) currentUser;
            List<Product> products = seller.getProducts();
            return ResponseEntity.ok(products != null ? products : new ArrayList<>());

        } catch (Exception e) {
            System.out.println("Error in getSellerProductsJWT: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(500).body("Error fetching seller products: " + e.getMessage());
        }
    }

    // JWT-authenticated endpoint for getting client orders
    @GetMapping("/client/orders-jwt")
    public ResponseEntity<?> getClientOrdersJWT(HttpServletRequest request) {
        try {
            System.out.println("=== GET CLIENT ORDERS JWT ENDPOINT CALLED ===");

            // Get authenticated user from JWT
            Long userId = (Long) request.getAttribute("userId");
            String userRole = (String) request.getAttribute("userRole");

            if (userId == null) {
                return ResponseEntity.status(401).body("User not authenticated");
            }

            if (!"client".equalsIgnoreCase(userRole)) {
                return ResponseEntity.status(403).body("Access denied. Only clients can access this endpoint.");
            }

            // Get the client
            User currentUser = userService.findById(userId);
            if (currentUser == null || !(currentUser instanceof Client)) {
                return ResponseEntity.status(404).body("Client not found");
            }

            Client client = (Client) currentUser;
            List<Panier> orders = panierService.getAllPanierByClient(client);
            return ResponseEntity.ok(orders != null ? orders : new ArrayList<>());

        } catch (Exception e) {
            System.out.println("Error in getClientOrdersJWT: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(500).body("Error fetching client orders: " + e.getMessage());
        }
    }
}