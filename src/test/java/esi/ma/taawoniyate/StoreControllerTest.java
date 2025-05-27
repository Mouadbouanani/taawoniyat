package esi.ma.taawoniyate;

import esi.ma.taawoniyate.controller.StoreController;
import esi.ma.taawoniyate.model.Product;
import esi.ma.taawoniyate.model.Category;
import esi.ma.taawoniyate.model.Seller;
import esi.ma.taawoniyate.repository.CategoryRepository;
import esi.ma.taawoniyate.repository.ProductRepository;
import esi.ma.taawoniyate.repository.SellerRepository;
import esi.ma.taawoniyate.service.SellerService;
import jakarta.servlet.http.HttpSession;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.http.ResponseEntity;

import java.util.Collections;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

public class StoreControllerTest {
    @Mock private ProductRepository productRepository;
    @Mock private CategoryRepository categoryRepository;
    @Mock private SellerRepository sellerRepository;
    @Mock private SellerService sellerService;
    @Mock private HttpSession session;

    @InjectMocks private StoreController storeController;

    @BeforeEach
    void setUp() { MockitoAnnotations.openMocks(this); }

    @Test
    void getAllProducts_returnsList() {
        when(productRepository.findAll()).thenReturn(Collections.emptyList());
        List<Product> result = storeController.getAllProducts();
        assertNotNull(result);
    }

    @Test
    void addProduct_returns401IfNotLoggedIn() {
        when(session.getAttribute("user")).thenReturn(null);
        Product product = new Product();
        ResponseEntity<?> response = storeController.addProduct(product, session);
        assertEquals(401, response.getStatusCodeValue());
    }
} 