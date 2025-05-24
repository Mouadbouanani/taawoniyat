package esi.ma.taawoniyate.service;

import esi.ma.taawoniyate.model.Client;
import esi.ma.taawoniyate.model.Seller;
import esi.ma.taawoniyate.model.User;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class AdminService {

    @Autowired
    private UserService userService;

    @Autowired
    private ClientService clientService;

    @Autowired
    private SellerService sellerService;

    // User management
    public Page<User> getAllUsers(Pageable pageable) {
        return userService.findAll(pageable);
    }

    public Page<Client> getAllClients(Pageable pageable) {
        return clientService.findAll(pageable);
    }

    public Page<Seller> getAllSellers(Pageable pageable) {
        return sellerService.findAll(pageable);
    }

    @Transactional
    public void deleteUser(Integer userId) {
        userService.deleteById(userId);
    }

    @Transactional
    public void deleteClient(Long clientId) {
        clientService.deleteById(clientId);
    }

    @Transactional
    public void deleteSeller(Integer sellerId) {
        sellerService.deleteById(sellerId);
    }

    // Statistics
    public long getTotalUsers() {
        return getAllUsers(Pageable.unpaged()).getTotalElements();
    }

    public long getTotalClients() {
        return getAllClients(Pageable.unpaged()).getTotalElements();
    }

    public long getTotalSellers() {
        return getAllSellers(Pageable.unpaged()).getTotalElements();
    }
}