package esi.ma.taawoniyate;

import esi.ma.taawoniyate.model.User;
import esi.ma.taawoniyate.service.AdminService;
import esi.ma.taawoniyate.service.UserService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;

import java.util.Collections;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

public class AdminServiceTest {
    @Mock private UserService userService;
    @InjectMocks private AdminService adminService;

    @BeforeEach
    void setUp() { MockitoAnnotations.openMocks(this); }

    @Test
    void getAllUsers_returnsNotNull() {
        Page<User> page = new PageImpl<>(Collections.emptyList());
        when(userService.findAll(any(Pageable.class))).thenReturn(page);
        Page<User> result = adminService.getAllUsers(Pageable.unpaged());
        assertNotNull(result);
    }
} 