package esi.ma.taawoniyate.model;

import jakarta.persistence.*;

import java.math.BigDecimal;
import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "panier")
public class Panier {
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private int panier_id;


    @OneToMany(mappedBy = "panier", cascade = CascadeType.ALL, orphanRemoval = true)
    private Set<PanierItem> items = new HashSet<>();


    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "client_id", nullable = false)
    private Client client;

    // methode calculTotalAmount

    public Panier() {
        this.items = new HashSet<>();
    }

}