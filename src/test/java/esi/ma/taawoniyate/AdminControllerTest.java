package esi.ma.taawoniyate;

import esi.ma.taawoniyate.controller.AdminController;
import esi.ma.taawoniyate.service.AdminService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.http.ResponseEntity;

import static org.junit.jupiter.api.Assertions.*;

public class AdminControllerTest {
    @Mock private AdminService adminService;

    @InjectMocks private AdminController adminController;

    @BeforeEach
    void setUp() { MockitoAnnotations.openMocks(this); }

    @Test
    void getAllUsers_returnsNotNull() {
        ResponseEntity<?> response = adminController.getAllUsers(0, 10, "id", "asc");
        assertNotNull(response);
    }
} 