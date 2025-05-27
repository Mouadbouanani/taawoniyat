package esi.ma.taawoniyate;

import esi.ma.taawoniyate.controller.PanierController;
import esi.ma.taawoniyate.model.Client;
import esi.ma.taawoniyate.model.Panier;
import esi.ma.taawoniyate.service.ClientService;
import esi.ma.taawoniyate.service.PanierService;
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

public class PanierControllerTest {
    @Mock private PanierService panierService;
    @Mock private ClientService clientService;
    @Mock private HttpSession session;

    @InjectMocks private PanierController panierController;

    @BeforeEach
    void setUp() { MockitoAnnotations.openMocks(this); }

    @Test
    void savePanier_returns401IfNotLoggedIn() {
        when(session.getAttribute("user")).thenReturn(null);
        Panier panier = new Panier();
        ResponseEntity<String> response = panierController.savePanier(panier, session);
        assertEquals(401, response.getStatusCodeValue());
    }

    @Test
    void getPaniers_returnsEmptyListIfNotLoggedIn() {
        when(session.getAttribute("user")).thenReturn(null);
        List<Panier> result = panierController.getPaniers(session);
        assertTrue(result.isEmpty());
    }
} 