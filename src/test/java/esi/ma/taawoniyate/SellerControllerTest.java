package esi.ma.taawoniyate;

import esi.ma.taawoniyate.controller.SellerController;
import esi.ma.taawoniyate.model.PanierItem;
import esi.ma.taawoniyate.model.Seller;
import esi.ma.taawoniyate.repository.PanierItemRepository;
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

public class SellerControllerTest {
    @Mock
    private SellerService sellerService;
    @Mock
    private PanierItemRepository panierItemRepository;
    @Mock
    private HttpSession session;

    @InjectMocks
    private SellerController sellerController;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
    }

    @Test
    void getMyPanierItems_returns401IfNotLoggedIn() {
        when(session.getAttribute("user")).thenReturn(null);
        ResponseEntity<?> response = sellerController.getMyPanierItems(session);
        assertEquals(401, response.getStatusCodeValue());
        assertEquals("Seller not logged in", response.getBody());
    }

    @Test
    void getMyPanierItems_returnsItemsForLoggedInSeller() {
        Seller seller = new Seller();
        when(session.getAttribute("user")).thenReturn(seller);
        List<PanierItem> mockItems = Collections.singletonList(new PanierItem());
        when(panierItemRepository.findAllBySeller(seller)).thenReturn(mockItems);
        ResponseEntity<?> response = sellerController.getMyPanierItems(session);
        assertEquals(200, response.getStatusCodeValue());
        assertEquals(mockItems, response.getBody());
    }
} 