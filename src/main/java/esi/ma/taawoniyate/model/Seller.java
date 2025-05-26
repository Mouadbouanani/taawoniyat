package esi.ma.taawoniyate.model;

import jakarta.persistence.*;
import org.hibernate.annotations.Type;

import java.util.List;
@Entity
public class Seller extends Client{

    @OneToMany(mappedBy = "seller", cascade = CascadeType.ALL)
    private List<Product> products;

    @Column(name = "businessName")
    private String businessName;

    public Seller() {
        super();
        this.setRole("seller");
    }

//    public Seller(String fullName, String email, String region, String password, String city, String address, String phone, String businessName) {
//        super(fullName, email, region, password, city, address, phone);
//        this.setRole("seller");
//        this.businessName = businessName;
//    }

    public List<Product> getProducts() {
        return products;
    }

    public void setProducts(List<Product> products) {
        this.products = products;
    }

    public String getBusinessName() {
        return businessName;
    }

    public void setBusinessName(String businessName) {
        this.businessName = businessName;
    }
}
