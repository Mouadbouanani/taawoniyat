package esi.ma.taawoniyate;

import esi.ma.taawoniyate.controller.ClientController;
import esi.ma.taawoniyate.service.ClientService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.http.ResponseEntity;

import static org.junit.jupiter.api.Assertions.*;

public class ClientControllerTest {
    @Mock private ClientService clientService;

    @InjectMocks private ClientController clientController;

    @BeforeEach
    void setUp() { MockitoAnnotations.openMocks(this); }

    @Test
    void getAllClients_returnsNotNull() {
        ResponseEntity<?> response = clientController.getAllClients(0, 10, "id", "asc");
        assertNotNull(response);
    }
} 