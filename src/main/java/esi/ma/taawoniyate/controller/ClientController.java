package esi.ma.taawoniyate.controller;

import esi.ma.taawoniyate.model.Client;
import esi.ma.taawoniyate.model.Product;
import esi.ma.taawoniyate.service.ClientService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;

import java.util.List;

@RestController
@RequestMapping("/api/clients")
@CrossOrigin(origins = "*")
public class ClientController {

    @Autowired
    private ClientService clientService;

    @GetMapping
    public ResponseEntity<Page<Client>> getAllClients(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "id") String sortBy,
            @RequestParam(defaultValue = "asc") String sortDir) {

        Sort sort = sortDir.equalsIgnoreCase("desc") ?
                Sort.by(sortBy).descending() :
                Sort.by(sortBy).ascending();

        Pageable pageable = PageRequest.of(page, size, sort);
        Page<Client> clients = clientService.findAll(pageable);

        return ResponseEntity.ok(clients);
    }

    @PostMapping
    public ResponseEntity<Client> createClient(@Valid @RequestBody Client client) {
        try {
            if (clientService.existsByEmail(client.getEmail())) {
                return ResponseEntity.status(HttpStatus.CONFLICT).build();
            }
            Client savedClient = clientService.save(client);
            return ResponseEntity.status(HttpStatus.CREATED).body(savedClient);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<Client> updateClient(@PathVariable Long id, @Valid @RequestBody Client client) {
        try {
            Client existingClient = clientService.findById(id);
            if (existingClient == null) {
                return ResponseEntity.notFound().build();
            }
            client.setId(id);
            Client updatedClient = clientService.update(client);
            return ResponseEntity.ok(updatedClient);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<Client> getClientById(@PathVariable Long id) {
        Client client = clientService.findById(id);
        return client != null ?
                ResponseEntity.ok(client) :
                ResponseEntity.notFound().build();
    }

    @GetMapping("/email/{email}")
    public ResponseEntity<Client> getClientByEmail(@PathVariable String email) {
        Client client = clientService.findByEmail(email);
        return client != null ?
                ResponseEntity.ok(client) :
                ResponseEntity.notFound().build();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteClient(@PathVariable Long id) {
        try {
            clientService.deleteById(id);
            return ResponseEntity.noContent().build();
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }

    // Favorite products endpoints
    @PostMapping("/{clientId}/favorites")
    public ResponseEntity<Client> addToFavorites(@PathVariable Long clientId, @RequestBody Product product) {
        try {
            Client updatedClient = clientService.addToFavorites(clientId, product);
            return updatedClient != null ?
                    ResponseEntity.ok(updatedClient) :
                    ResponseEntity.notFound().build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        }
    }

    @DeleteMapping("/{clientId}/favorites")
    public ResponseEntity<Client> removeFromFavorites(@PathVariable Long clientId, @RequestBody Product product) {
        try {
            Client updatedClient = clientService.removeFromFavorites(clientId, product);
            return updatedClient != null ?
                    ResponseEntity.ok(updatedClient) :
                    ResponseEntity.notFound().build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        }
    }

    @GetMapping("/{clientId}/favorites")
    public ResponseEntity<List<Product>> getFavoriteProducts(@PathVariable Long clientId) {
        List<Product> favorites = clientService.getFavoriteProducts(clientId);
        return ResponseEntity.ok(favorites);
    }

    @GetMapping("/city/{city}")
    public ResponseEntity<List<Client>> getClientsByCity(@PathVariable String city) {
        List<Client> clients = clientService.findByCity(city);
        return ResponseEntity.ok(clients);
    }

    @GetMapping("/region/{region}")
    public ResponseEntity<List<Client>> getClientsByRegion(@PathVariable String region) {
        List<Client> clients = clientService.findByRegion(region);
        return ResponseEntity.ok(clients);
    }
}