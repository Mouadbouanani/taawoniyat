package esi.ma.taawoniyate.model;


//import jakarta.persistence.Entity;
//import jakarta.persistence.GeneratedValue;
//import jakarta.persistence.Id;
import jakarta.persistence.*;

@Entity
@Table(name = "users")
public abstract class User {
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private long id ;
    @Column
    private String fullName ;
    @Column
    private String email ;
    @Column
    private String region ;
    @Column
    private String password ;
    @Column
    private String city;
    @Column
    private String Address;
    @Column(name = "phone")
    private String phone;
    @Column
    private String role; // client, admin, seller

    public User(long id, String fullName, String email, String region, String password, String city, String address, String phone, String role) {
        this.id = id;
        this.fullName = fullName;
        this.email = email;
        this.region = region;
        this.password = password;
        this.city = city;
        Address = address;
        this.phone = phone;
        this.role = role;
    }


    public String getPhone() {
        return phone;
    }

    public void setPhone(String phone) {
        this.phone = phone;
    }

    public User(){

    }

    public long getId() {
        return id;
    }

    public void setId(long id) {
        this.id = id;
    }

    public String getFullName() {
        return fullName;
    }

    public void setFullName(String fullName) {
        this.fullName = fullName;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getRegion() {
        return region;
    }

    public void setRegion(String region) {
        this.region = region;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public String getCity() {
        return city;
    }

    public void setCity(String city) {
        this.city = city;
    }

    public String getAddress() {
        return Address;
    }

    public void setAddress(String address) {
        Address = address;
    }

    public String getRole() {
        return role;
    }

    public void setRole(String role) {
        this.role = role;
    }
}
