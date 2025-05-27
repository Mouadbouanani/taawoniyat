package esi.ma.taawoniyate;

import esi.ma.taawoniyate.model.Panier;
import esi.ma.taawoniyate.repository.PanierRepository;
import esi.ma.taawoniyate.service.PanierService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;

import java.util.Collections;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

public class PanierServiceTest {
    @Mock private PanierRepository panierRepository;
    @InjectMocks private PanierService panierService;

    @BeforeEach
    void setUp() { MockitoAnnotations.openMocks(this); }

    @Test
    void getAllPanier_returnsNotNull() {
        when(panierRepository.findAll()).thenReturn(Collections.emptyList());
        List<Panier> result = panierService.getAllPanier();
        assertNotNull(result);
    }
} 