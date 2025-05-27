package esi.ma.taawoniyate;

import esi.ma.taawoniyate.model.Seller;
import esi.ma.taawoniyate.repository.SellerRepository;
import esi.ma.taawoniyate.service.SellerService;
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

public class SellerServiceTest {
    @Mock private SellerRepository sellerRepository;
    @InjectMocks private SellerService sellerService;

    @BeforeEach
    void setUp() { MockitoAnnotations.openMocks(this); }

    @Test
    void findAll_returnsNotNull() {
        Pageable pageable = PageRequest.of(0, 10);
        Page<Seller> page = new PageImpl<>(Collections.emptyList());
        when(sellerRepository.findAll(pageable)).thenReturn(page);
        Page<Seller> result = sellerService.findAll(pageable);
        assertNotNull(result);
    }
} 