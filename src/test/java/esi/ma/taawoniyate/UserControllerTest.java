package esi.ma.taawoniyate;

import esi.ma.taawoniyate.controller.UserController;
import esi.ma.taawoniyate.service.UserService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.http.ResponseEntity;

import static org.junit.jupiter.api.Assertions.*;

public class UserControllerTest {
    @Mock private UserService userService;

    @InjectMocks private UserController userController;

    @BeforeEach
    void setUp() { MockitoAnnotations.openMocks(this); }

    @Test
    void getAllUsers_returnsNotNull() {
        ResponseEntity<?> response = userController.getAllUsers(0, 10, "id", "asc");
        assertNotNull(response);
    }
} 