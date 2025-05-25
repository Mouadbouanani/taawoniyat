package esi.ma.taawoniyate.controller;


import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import esi.ma.taawoniyate.repository.ProductRepository;
import java.util.List;

@RestController
@RequestMapping("/store")
public class ProductController {

    @Autowired
    ProductRepository productRepository;

}
