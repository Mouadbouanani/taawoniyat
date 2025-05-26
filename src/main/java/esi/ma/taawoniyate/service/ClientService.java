package esi.ma.taawoniyate.service;

import esi.ma.taawoniyate.model.Client;
import esi.ma.taawoniyate.model.Panier;
import esi.ma.taawoniyate.model.Product;
import esi.ma.taawoniyate.repository.ClientRepository;
import esi.ma.taawoniyate.repository.PanierRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional
public class ClientService {

    @Autowired
    private ClientRepository clientRepository;

    @Autowired
    private PanierRepository panierRepository;

    @Cacheable(value = "clients", key = "#email")
    public Client findByEmail(String email) {
        return (Client) clientRepository.findByEmail(email);
    }

    @Cacheable(value = "clients", key = "#id")
    public Client findById(long id) {
        return (Client) clientRepository.findById(id);
    }

    public List<Client> findByCity(String city) {
        return List.of((Client) clientRepository.findByCity(city));
    }

    public List<Client> findByRegion(String region) {
        return List.of((Client) clientRepository.findByRegion(region));
    }

    public Page<Client> findAll(Pageable pageable) {
        return clientRepository.findAll(pageable);
    }

    @Transactional
    @CacheEvict(value = {"clients", "users"}, key = "#client.id")
    public Client save(Client client) {
        if (client.getRole() == null) {
            client.setRole("client");
        }
        return clientRepository.save(client);
    }

    public Panier getClientPanier(Client client) {
         return panierRepository.findByClient(client);

    }

    @Transactional
    @CacheEvict(value = {"clients", "users"}, key = "#client.id")
    public Client update(Client client) {
        return clientRepository.save(client);
    }

    @Transactional
    @CacheEvict(value = {"clients", "users"}, key = "#id")
    public void deleteById(Long id) {
        clientRepository.deleteById(id);
    }

    // Favorite products management
    @Transactional
    public Client addToFavorites(Long clientId, Product product) {
        Client client = findById(clientId);
        if (client != null && !client.getProduitFavoris().contains(product)) {
            client.getProduitFavoris().add(product);
            return clientRepository.save(client);
        }
        return client;
    }

    @Transactional
    public Client removeFromFavorites(Long clientId, Product product) {
        Client client = findById(clientId);
        if (client != null) {
            client.getProduitFavoris().remove(product);
            return clientRepository.save(client);
        }
        return client;
    }

    public List<Product> getFavoriteProducts(Long clientId) {
        Client client = findById(clientId);
        return client != null ? client.getProduitFavoris() : List.of();
    }

    public boolean existsByEmail(String email) {
        return clientRepository.findByEmail(email) != null;
    }
}