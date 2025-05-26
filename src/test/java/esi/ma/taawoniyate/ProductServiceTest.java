package esi.ma.taawoniyate;

import esi.ma.taawoniyate.model.Product;
import esi.ma.taawoniyate.repository.ProductRepository;
import esi.ma.taawoniyate.service.ProductService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;

import java.util.Collections;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

public class ProductServiceTest {
    @Mock private ProductRepository productRepository;
    @InjectMocks private ProductService productService;

    @BeforeEach
    void setUp() { MockitoAnnotations.openMocks(this); }

    @Test
    void getAllProducts_returnsNotNull() {
        when(productRepository.findAll()).thenReturn(Collections.emptyList());
        List<Product> result = productService.getAllProducts();
        assertNotNull(result);
    }
} 