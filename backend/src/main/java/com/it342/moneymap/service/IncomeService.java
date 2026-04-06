package com.it342.moneymap.service;

import com.it342.moneymap.dto.IncomeDto;
import com.it342.moneymap.entity.Income;
import com.it342.moneymap.entity.User;
import com.it342.moneymap.repository.IncomeRepository;
import com.it342.moneymap.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class IncomeService {

    @Autowired
    private IncomeRepository incomeRepository;

    @Autowired
    private UserRepository userRepository;

    public List<IncomeDto> getIncomesByUserId(Long userId) {
        return incomeRepository.findByUserId(userId).stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    public IncomeDto createIncome(IncomeDto incomeDto) {
        User user = userRepository.findById(incomeDto.getUserId())
                .orElseThrow(() -> new RuntimeException("User not found"));

        Income income = new Income();
        income.setUser(user);
        income.setSourceName(incomeDto.getSourceName());
        income.setCategory(incomeDto.getCategory());
        income.setAmount(incomeDto.getAmount());
        income.setDate(incomeDto.getDate() != null ? incomeDto.getDate() : LocalDate.now());
        income.setStatus(incomeDto.getStatus() != null ? incomeDto.getStatus() : "Received");
        income.setNotes(incomeDto.getNotes());

        Income saved = incomeRepository.save(income);
        return mapToDto(saved);
    }

    public void deleteIncome(Long id) {
        incomeRepository.deleteById(id);
    }

    private IncomeDto mapToDto(Income income) {
        IncomeDto dto = new IncomeDto();
        dto.setId(income.getId());
        dto.setUserId(income.getUser().getId());
        dto.setSourceName(income.getSourceName());
        dto.setCategory(income.getCategory());
        dto.setAmount(income.getAmount());
        dto.setDate(income.getDate());
        dto.setStatus(income.getStatus());
        dto.setNotes(income.getNotes());
        return dto;
    }
}
