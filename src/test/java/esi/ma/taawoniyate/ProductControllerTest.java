package esi.ma.taawoniyate;

import esi.ma.taawoniyate.controller.ProductController;
import esi.ma.taawoniyate.model.Product;
import esi.ma.taawoniyate.repository.ProductRepository;
import esi.ma.taawoniyate.repository.ProductImageRepository;
import esi.ma.taawoniyate.repository.UserRepository;
import esi.ma.taawoniyate.service.CloudinaryService;
import jakarta.servlet.http.HttpSession;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.http.ResponseEntity;
import org.springframework.web.multipart.MultipartFile;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

public class ProductControllerTest {
    @Mock private CloudinaryService cloudinaryService;
    @Mock private ProductRepository productRepository;
    @Mock private ProductImageRepository productImageRepository;
    @Mock private UserRepository userRepository;
    @Mock private HttpSession session;

    @InjectMocks private ProductController productController;

    @BeforeEach
    void setUp() { MockitoAnnotations.openMocks(this); }

    @Test
    void uploadProductImage_returnsNotFoundIfProductMissing() {
        when(productRepository.findById(anyInt())).thenReturn(java.util.Optional.empty());
        ResponseEntity<String> response = productController.uploadProductImage(1L, mock(MultipartFile.class));
        assertEquals(404, response.getStatusCodeValue());
    }
} 