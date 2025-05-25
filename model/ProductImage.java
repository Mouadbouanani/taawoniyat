package esi.ma.taawoniyate.model;

import jakarta.persistence.*;

@Entity
@Table(name = "product_images")
public class ProductImage {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private long id;

    @Column(nullable = false)
    private String imageUrl; // URL from Firebase Storage

    @ManyToOne
    @JoinColumn(name = "product_id", nullable = false)
    private Product product;



}