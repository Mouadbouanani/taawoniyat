package esi.ma.taawoniyate.model;

import jakarta.persistence.*;
import lombok.Data;

import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "category")
@Data
public class Category {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name="name",nullable = false, unique = true)
    private String name;

    public Category(){

    }
    @OneToMany
    @JoinColumn(name="category", nullable=false)
    private ArrayList<Product> products;

    public long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public List<Product> getProduits() {
        return products;
    }

    public void setProduits(ArrayList<Product> produits) {
        this.products = produits;
    }
}