package esi.ma.taawoniyate.aspect;

import org.aspectj.lang.JoinPoint;
import org.aspectj.lang.annotation.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

@Aspect
@Component
public class LoggingAspect {
    private final Logger logger = LoggerFactory.getLogger(this.getClass());

    @Before("execution(* esi.ma.taawoniyate..*(..))")
    public void logBefore(JoinPoint joinPoint) {
        logger.info("Entering: {} with arguments = {}", joinPoint.getSignature(), joinPoint.getArgs());
    }

    @AfterReturning(pointcut = "execution(* esi.ma.taawoniyate..*(..))", returning = "result")
    public void logAfterReturning(JoinPoint joinPoint, Object result) {
        logger.info("Exiting: {} with result = {}", joinPoint.getSignature(), result);
    }

    @AfterThrowing(pointcut = "execution(* esi.ma.taawoniyate..*(..))", throwing = "ex")
    public void logAfterThrowing(JoinPoint joinPoint, Throwable ex) {
        logger.error("Exception in {} with cause = {}", joinPoint.getSignature(), ex.getMessage());
    }
} 