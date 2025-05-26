package esi.ma.taawoniyate.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;

@Entity
@Table(name = "panier")
public class Panier {
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private int panier_id;

    @Column(nullable = false)
    private LocalDateTime date;

    @OneToMany(mappedBy = "panier", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.EAGER)
    private Set<PanierItem> items = new HashSet<PanierItem>();

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "client_id", nullable = false)
    private Client client;

    // methode calculTotalAmount

    public Panier() {
        this.date = LocalDateTime.now();
    }

    public int getPanier_id() {
        return panier_id;
    }

    public void setPanier_id(int panier_id) {
        this.panier_id = panier_id;
    }

    public String getDate() {
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm");
        return formatter.format(date);
    }

    public void setCreated_at(LocalDateTime created_at) {
        this.date = created_at;
    }

    public List<Map<String, Object>> getItems() {
        List<Map<String, Object>> result = new ArrayList<>();
        for (PanierItem item : items) {
            Map<String, Object> map = new HashMap<>();
            map.put("product", item.getProduct());
            map.put("quantity", item.getQuantity());
            map.put("price", item.getPrice());
            result.add(map);
        }
        return result;
    }

    @JsonIgnore
    public Set<PanierItem> getAllItems() {
        return items;
    }

    public void setItems(Set<PanierItem> items) {
        this.items = items;
    }

    public String getClient() {
        return client.getFullName();
    }

    public void setClient(Client client) {
        this.client = client;
    }

    @JsonIgnore
    public Set<PanierItem> getRawItems() {
        return this.items;
    }

    public double getTotalAmount() {
        double total = 0.0;
        for (PanierItem item : items) {
            if (item.getPrice() != null) {
                total += item.getPrice().doubleValue() * item.getQuantity();
            }
        }
        return total;
    }
}