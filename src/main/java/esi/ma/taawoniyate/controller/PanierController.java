package esi.ma.taawoniyate.controller;

import esi.ma.taawoniyate.model.Client;
import esi.ma.taawoniyate.model.Panier;
import esi.ma.taawoniyate.model.PanierItem;
import esi.ma.taawoniyate.model.Product;
import esi.ma.taawoniyate.model.User;
import esi.ma.taawoniyate.model.Seller;
import esi.ma.taawoniyate.service.ClientService;
import esi.ma.taawoniyate.service.PanierService;
import esi.ma.taawoniyate.service.SellerService;
import esi.ma.taawoniyate.service.ProductService;
import esi.ma.taawoniyate.service.UserService;
import jakarta.servlet.http.HttpSession;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.HashMap;
import java.math.BigDecimal;
import org.springframework.http.HttpStatus;
import java.util.Optional;

@RestController
@RequestMapping("/api/panier")
@CrossOrigin(origins = {"http://localhost:8081", "http://localhost:8083"}, allowCredentials = "true")
public class PanierController {
    @Autowired
    private PanierService panierService;

    @Autowired
    private ClientService clientService;

    @Autowired
    private SellerService sellerService;

    @Autowired
    private ProductService productService;

    @Autowired
    private UserService userService;

    @PostMapping("/save")
    public ResponseEntity<?> savePanier(@RequestBody Panier panier) {
        try {
            // Get the client
            Client client = clientService.findById(panier.getClientId());
            if (client == null) {
                return ResponseEntity.badRequest().body("Client not found");
            }
            panier.setClient(client);

            // Process each item in the panier
            for (PanierItem item : panier.getRawItems()) {
                // Get the seller
                Optional<Seller> sellerOpt = sellerService.findById(Integer.valueOf((int) item.getSellerEntity().getId()));
                if (sellerOpt.isEmpty()) {
                    return ResponseEntity.badRequest().body("Seller not found for item: " + item.getProduct());
                }
                Seller seller = sellerOpt.get();

                // Set the seller and client for the item
                item.setSeller(seller);
                item.setClient(client);
                item.setPanier(panier);
            }

            // Save the panier
            panierService.savePanier(panier);
            return ResponseEntity.ok(panier);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error saving panier: " + e.getMessage());
        }
    }

    @GetMapping("/history")
    public ResponseEntity<List<Panier>> getPaniers() {
        try {
            List<Panier> paniers = panierService.getAllPanier();
            return ResponseEntity.ok(paniers);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(null);
        }
    }

    // JWT-authenticated endpoint for saving cart as panier
    @PostMapping("/save-cart")
    public ResponseEntity<?> saveCartAsPanier(@RequestBody Map<String, Object> requestData, HttpServletRequest request) {
        try {
            System.out.println("=== SAVE CART AS PANIER ENDPOINT CALLED ===");
            System.out.println("Request data: " + requestData);

            // Get authenticated user from JWT
            Long userId = (Long) request.getAttribute("userId");
            String userRole = (String) request.getAttribute("userRole");

            System.out.println("User ID from JWT: " + userId);
            System.out.println("User Role from JWT: " + userRole);

            if (userId == null) {
                System.out.println("User not authenticated - userId is null");
                return ResponseEntity.status(401).body("User not authenticated");
            }

            // Allow both clients and sellers to save cart
            System.out.println("User role: " + userRole + " - allowing cart save");

            // Get the user
            User user = userService.findById(userId);
            if (user == null) {
                return ResponseEntity.status(404).body("User not found");
            }

            // Handle both clients and sellers
            Client client;
            if (user instanceof Client) {
                client = (Client) user;
                System.out.println("User is a client: " + client.getFullName());
            } else {
                // For sellers, we'll treat them as clients for cart functionality
                // Create a temporary client object with seller's data
                client = new Client();
                client.setId(user.getId());
                client.setFullName(user.getFullName());
                client.setEmail(user.getEmail());
                client.setPhone(user.getPhone());
                client.setAddress(user.getAddress());
                client.setCity(user.getCity());
                client.setRegion(user.getRegion());
                client.setRole(user.getRole());
                System.out.println("User is a seller, treating as client for cart: " + client.getFullName());
            }

            // Get cart items from request
            @SuppressWarnings("unchecked")
            List<Map<String, Object>> items = (List<Map<String, Object>>) requestData.get("items");

            if (items == null || items.isEmpty()) {
                return ResponseEntity.badRequest().body("No items in cart");
            }

            // Check if panier already exists for this client
            Panier panier = panierService.findByClientId(client.getId());
            if (panier != null) {
                System.out.println("Existing panier found for client " + client.getId() + ", clearing items");
                // Clear existing items
                panier.getRawItems().clear();
            } else {
                System.out.println("Creating new panier for client " + client.getId());
                // Create new panier
                panier = new Panier();
                panier.setClient(client);
                panier.setClientId(client.getId());
            }

            // Process each cart item
            for (Map<String, Object> itemData : items) {
                Integer productId = (Integer) itemData.get("productId");
                Integer quantity = (Integer) itemData.get("quantity");
                Double price = ((Number) itemData.get("price")).doubleValue();

                // Get the product
                Product product = productService.getProductById(productId);
                if (product == null) {
                    return ResponseEntity.badRequest().body("Product not found: " + productId);
                }

                // Get the seller from the product using reflection (since it's @JsonIgnore)
                Seller seller = null;
                try {
                    java.lang.reflect.Field sellerField = Product.class.getDeclaredField("seller");
                    sellerField.setAccessible(true);
                    seller = (Seller) sellerField.get(product);
                } catch (Exception e) {
                    System.out.println("Error accessing seller field: " + e.getMessage());
                }

                if (seller == null) {
                    return ResponseEntity.badRequest().body("Seller not found for product: " + productId);
                }

                // Create panier item
                PanierItem panierItem = new PanierItem();
                panierItem.setProduct(product);
                panierItem.setQuantity(quantity);
                panierItem.setPrice(BigDecimal.valueOf(price));
                panierItem.setSeller(seller);
                panierItem.setClient(client);
                panierItem.setPanier(panier);

                // Add item to panier
                panier.getRawItems().add(panierItem);
            }

            // Save the panier
            panierService.savePanier(panier);

            System.out.println("Cart saved as panier successfully for client: " + client.getFullName());
            return ResponseEntity.ok("Cart saved successfully");

        } catch (Exception e) {
            System.out.println("Error in saveCartAsPanier: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(500).body("Error saving cart: " + e.getMessage());
        }
    }

    // Get client orders (for clients to see their order history)
    @GetMapping("/client-orders")
    public ResponseEntity<?> getClientOrders(HttpServletRequest request) {
        try {
            System.out.println("=== GET CLIENT ORDERS ENDPOINT CALLED ===");

            // Get authenticated user from JWT
            Long userId = (Long) request.getAttribute("userId");
            String userRole = (String) request.getAttribute("userRole");

            if (userId == null) {
                return ResponseEntity.status(401).body("User not authenticated");
            }

            System.out.println("Fetching orders for user ID: " + userId + ", role: " + userRole);

            // Get the user (works for both clients and sellers)
            User user = userService.findById(userId);
            if (user == null) {
                return ResponseEntity.status(404).body("User not found");
            }

            // Create a temporary client object to find paniers
            Client tempClient = new Client();
            tempClient.setId(user.getId());

            // Get all paniers for this user
            List<Panier> userPaniers = panierService.getAllPanierByClient(tempClient);

            System.out.println("Found " + userPaniers.size() + " orders for user: " + user.getFullName());
            return ResponseEntity.ok(userPaniers);

        } catch (Exception e) {
            System.out.println("Error in getClientOrders: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(500).body("Error fetching orders: " + e.getMessage());
        }
    }

    // Get seller orders (for sellers to see orders containing their products)
    @GetMapping("/seller-orders")
    public ResponseEntity<?> getSellerOrders(HttpServletRequest request) {
        try {
            System.out.println("=== GET SELLER ORDERS ENDPOINT CALLED ===");

            // Get authenticated user from JWT
            Long userId = (Long) request.getAttribute("userId");
            String userRole = (String) request.getAttribute("userRole");

            if (userId == null) {
                return ResponseEntity.status(401).body("User not authenticated");
            }

            System.out.println("Fetching seller orders for user ID: " + userId + ", role: " + userRole);

            // Get all paniers and filter for items from this seller
            List<Panier> allPaniers = panierService.getAllPanier();
            List<Map<String, Object>> sellerOrders = new ArrayList<>();

            for (Panier panier : allPaniers) {
                List<Map<String, Object>> sellerItems = new ArrayList<>();

                for (PanierItem item : panier.getRawItems()) {
                    // Check if this item belongs to the current seller
                    if (item.getSellerEntity() != null && item.getSellerEntity().getId() == userId.longValue()) {
                        Map<String, Object> itemInfo = new HashMap<>();
                        itemInfo.put("product", item.getProduct());
                        itemInfo.put("quantity", item.getQuantity());
                        itemInfo.put("price", item.getPrice());
                        itemInfo.put("client", panier.getClient());
                        itemInfo.put("orderDate", panier.getDate());
                        itemInfo.put("orderId", panier.getPanier_id());
                        sellerItems.add(itemInfo);
                    }
                }

                if (!sellerItems.isEmpty()) {
                    Map<String, Object> orderInfo = new HashMap<>();
                    orderInfo.put("orderId", panier.getPanier_id());
                    orderInfo.put("client", panier.getClient());
                    orderInfo.put("orderDate", panier.getDate());
                    orderInfo.put("items", sellerItems);
                    sellerOrders.add(orderInfo);
                }
            }

            System.out.println("Found " + sellerOrders.size() + " orders containing products from seller: " + userId);
            return ResponseEntity.ok(sellerOrders);

        } catch (Exception e) {
            System.out.println("Error in getSellerOrders: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(500).body("Error fetching seller orders: " + e.getMessage());
        }
    }

    // Test endpoint to verify controller is working
    @GetMapping("/test")
    public ResponseEntity<String> testEndpoint() {
        System.out.println("=== PANIER TEST ENDPOINT CALLED ===");
        return ResponseEntity.ok("Panier controller is working!");
    }
}
