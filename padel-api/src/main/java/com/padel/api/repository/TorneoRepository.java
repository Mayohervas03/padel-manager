package com.padel.api.repository;

import com.padel.api.model.Torneo;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface TorneoRepository extends JpaRepository<Torneo, Long> {
    List<Torneo> findByFechaFinGreaterThanEqualOrderByFechaFinAsc(LocalDate date);
}
