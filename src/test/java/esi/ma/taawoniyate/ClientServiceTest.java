package esi.ma.taawoniyate;

import esi.ma.taawoniyate.model.Client;
import esi.ma.taawoniyate.repository.ClientRepository;
import esi.ma.taawoniyate.service.ClientService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;

import java.util.Collections;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

public class ClientServiceTest {
    @Mock private ClientRepository clientRepository;
    @InjectMocks private ClientService clientService;

    @BeforeEach
    void setUp() { MockitoAnnotations.openMocks(this); }

    @Test
    void findAll_returnsNotNull() {
        Pageable pageable = PageRequest.of(0, 10);
        Page<Client> page = new PageImpl<>(Collections.emptyList());
        when(clientRepository.findAll(pageable)).thenReturn(page);
        Page<Client> result = clientService.findAll(pageable);
        assertNotNull(result);
    }
} 