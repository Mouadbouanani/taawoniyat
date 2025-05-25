package esi.ma.taawoniyate.model;

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
    private List<PanierItem> items ;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "client_id", nullable = false)
    private Client client;

    public Panier() {
        this.items = new ArrayList<>();
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

    public List<PanierItem> getItems() {

        return items;
    }

    public void setItems(List<PanierItem> items) {
        this.items = items;
    }

    public String getClient() {
        return client.getFullName();
    }

    public void setClient(Client client) {
        this.client = client;
    }
}