package esi.ma.taawoniyate.dto;

import esi.ma.taawoniyate.model.Product;
import esi.ma.taawoniyate.model.Seller;

import java.util.List;

public class ProductDetailsResponse {
    private long id;
    private String name;
    private String description;
    private double price;
    private int quantity;
    private String category;
    private List<String> images;
    private SellerInfo seller;

    public static class SellerInfo {
        private long id;
        private String fullName;
        private String businessName;
        private String email;
        private String phone;
        private String address;
        private String city;
        private String region;

        public SellerInfo() {}

        public SellerInfo(Seller seller) {
            this.id = seller.getId();
            this.fullName = seller.getFullName();
            this.businessName = seller.getBusinessName();
            this.email = seller.getEmail();
            this.phone = seller.getPhone();
            this.address = seller.getAddress();
            this.city = seller.getCity();
            this.region = seller.getRegion();
        }

        // Getters and setters
        public long getId() { return id; }
        public void setId(long id) { this.id = id; }

        public String getFullName() { return fullName; }
        public void setFullName(String fullName) { this.fullName = fullName; }

        public String getBusinessName() { return businessName; }
        public void setBusinessName(String businessName) { this.businessName = businessName; }

        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }

        public String getPhone() { return phone; }
        public void setPhone(String phone) { this.phone = phone; }

        public String getAddress() { return address; }
        public void setAddress(String address) { this.address = address; }

        public String getCity() { return city; }
        public void setCity(String city) { this.city = city; }

        public String getRegion() { return region; }
        public void setRegion(String region) { this.region = region; }
    }

    public ProductDetailsResponse() {}

    public ProductDetailsResponse(Product product) {
        this.id = product.getId();
        this.name = product.getName();
        this.description = product.getDescription();
        this.price = product.getPrice();
        this.quantity = product.getQuantity();
        this.category = product.getCategory();
        this.images = product.getImages();
        
        // Get the seller entity using reflection or a custom method
        // Since seller is @JsonIgnore, we need to access it directly
        try {
            java.lang.reflect.Field sellerField = Product.class.getDeclaredField("seller");
            sellerField.setAccessible(true);
            Seller sellerEntity = (Seller) sellerField.get(product);
            if (sellerEntity != null) {
                this.seller = new SellerInfo(sellerEntity);
            }
        } catch (Exception e) {
            // Handle reflection error
            this.seller = null;
        }
    }

    // Getters and setters
    public long getId() { return id; }
    public void setId(long id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public double getPrice() { return price; }
    public void setPrice(double price) { this.price = price; }

    public int getQuantity() { return quantity; }
    public void setQuantity(int quantity) { this.quantity = quantity; }

    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }

    public List<String> getImages() { return images; }
    public void setImages(List<String> images) { this.images = images; }

    public SellerInfo getSeller() { return seller; }
    public void setSeller(SellerInfo seller) { this.seller = seller; }
}
