package esi.ma.taawoniyate.controller;

import esi.ma.taawoniyate.model.Client;
import esi.ma.taawoniyate.model.Product;
import esi.ma.taawoniyate.model.Seller;
import esi.ma.taawoniyate.model.User;
import esi.ma.taawoniyate.repository.UserRepository;
import esi.ma.taawoniyate.service.UserService;
import jakarta.servlet.http.HttpSession;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/users")
@CrossOrigin(origins = "http://localhost:8085")
public class UserController {

    @Autowired
    private UserService userService;
    @Autowired
    private UserRepository userRepository;
    @Autowired
    private HttpSession session;


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

    @PostMapping("/authenticate")
    public ResponseEntity<Map<String, Object>> authenticateUser(@RequestBody AuthRequest authRequest) {
        Map<String, Object> response = new HashMap<>();

        try {
            User user = userRepository.authenticateUser(authRequest.getEmail(), authRequest.getPassword());

            if (user != null) {
                response.put("success", true);
                response.put("message", "Authentication successful");
                response.put("user", user);
                session.setAttribute("user", user);
                session.setAttribute("id", user.getId());
                return ResponseEntity.ok(response);
            } else {
                response.put("success", false);
                response.put("message", "Invalid email or password");
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response);
            }
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Authentication failed: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }
    @GetMapping("/me")
    public ResponseEntity<User> getCurrentUser() {
        if (session.getAttribute("user") != null) {
            User user = (User) session.getAttribute("user");
            return ResponseEntity.ok(user);
        }else {
            return ResponseEntity.notFound().build();
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

    @PostMapping("/register/client")
    public ResponseEntity<Map<String, Object>> registerClient(@RequestBody Client client) {
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

    @PostMapping("/register/seller")
    public ResponseEntity<Map<String, Object>> registerSeller(@RequestBody Seller seller) {
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
}