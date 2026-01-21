# 📊 Onboarding Flow - Parent-in API

## Descripción General

El flujo de onboarding de Parent-in consta de **2 pasos principales**:

1. **Paso 1 (START)**: Datos generales del usuario + tipo de usuario
2. **Paso 2**: Datos parentales y específicos según etapa + temas de aprendizaje (finalización)

---

## 🔄 Flujo Detallado

┌─────────────────────────────────────────────────────────────────────────────────┐
│ ONBOARDING FLOW - PARENT-IN API (SIMPLIFICADO) │
└─────────────────────────────────────────────────────────────────────────────────┘

┌──────────────────┐
│ PASO 1: START │
│ POST /start │
│ (UserDataDto) │
├──────────────────┤
│ • birthday │
│ • city │
│ • country │
│ • genre │
│ • phone │
│ • userType │ ◄─────────────┐
└──────────────────┘ │
│ │
│ ¿userType?
▼ │
┌──────────────────────────────────┴──────────────┐
│ │
│ PREGUNTA: ¿Qué tipo de usuario? │
│ │
└──────────────────────────────────┬──────────────┘
│
┌────────────────────┼────────────────────┐
│ │ │
(parental) (other) (other)
│ │ │
▼ ▼ ▼
┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐
│ PASO 2-A: │ │ PASO 2-B: │ │ PASO 2-C: │
│ PARENTAL │ │ ... (future) │ │ ... (future) │
│ POST /parental │ │ │ │ │
└─────────────────┘ └─────────────────┘ └─────────────────┘
│
▼
┌──────────────────────────────────┐
│ ALMACENA: │
│ • familyType │
│ • numberOfChildren │
│ • currentEmploymentStatus │
│ • jobRole │
│ • organizationType │
│ • currentStage ◄─────────────┐ │
│ • userDescription │ │
└──────────────────────────────────┘
│ │
│ ¿Etapa actual?
│ │
▼ │
┌──────────────────────────────────┘
│
│
├─────────────┬──────────────┬──────────────┐
│ │ │ │
▼ ▼ ▼ ▼
PRE_LICENSE LICENSE POST_LICENSE
│ │ │
└─────────────┴──────────────┴──────────────┐
│
▼
┌───────────────────────────────────────────┐
│ PASO 2-FINAL (CONSOLIDADO): │
│ PUT /stage-details │
│ (StageDetailsDto + LearningTopicsDto) │
└───────────────────────────────────────────┘
│
┌───────────┴────────────────────┐
│ │
Según currentStage, envías SOLO estos datos:
│ │
┌───────────────────┼────────────────────┬──────────┘
│ │ │
▼ ▼ ▼
PRE_LICENSE: LICENSE: POST_LICENSE:
• trimester • babyBirthDate • returnDate
• estimatedDueDate • licenseDuration • workModality
• supportNeeds • supportNeeds • supportNeeds
│ │ │
└───────────────────┼────────────────────┘
│
▼ (SIEMPRE envía learning topics aquí)
│
└──────────────────────────┐
│
▼
┌──────────────────────────────────┐
│ • learningTopics[] │
│ (array de temas) │
│ │
│ ✅ FINALIZA │
│ is_onboarding_ │
│ completed = TRUE │
│ │
└──────────────────────────────────┘



---

## 📋 Resumen de Endpoints

| Paso | Endpoint | Método | DTOs | Descripción |
|------|----------|--------|------|-------------|
| **1** | `/onboarding/start` | `POST` | `UserDataDto` | Datos generales (birthday, ciudad, país, género, teléfono, tipo de usuario) |
| **2a** | `/onboarding/parental` | `POST` | `ParentalUserDto` | Datos parentales (solo si `userType = parental`) |
| **2b** | `/onboarding/stage-details` | `PUT` | `StageDetailsDto + learningTopics` | Datos de etapa + temas de aprendizaje, **finaliza onboarding** |

---

## 🔑 Puntos Clave

### Paso 1: START
- Define el **tipo de usuario** (`userType`)
- Requerido para todos

### Paso 2A: PARENTAL (Solo usuarios parentales)
- Define la **etapa actual** (`currentStage`: PRE_LICENSE, LICENSE, POST_LICENSE)
- Almacena datos laborales y familiares

### Paso 2B: STAGE-DETAILS (Detalles por etapa)
- **Solo envía campos de tu+ LEARNING-TOPICS (Consolidado)
- **Solo envía campos de tu etapa actual**:
  - **PRE_LICENSE**: `trimester`, `estimatedDueDate`, `preLicenseSupportNeeds`
  - **LICENSE**: `babyBirthDate`, `licenseDuration`, `licenseSupportNeeds`
  - **POST_LICENSE**: `returnDate`, `workModality`, `postLicenseSupportNeeds`
- **SIEMPRE incluye**: `learningTopics` (array de temas de interés)
- **Marca el onboarding como completado** automáticamente
---

## 🚀 Guardias de Acceso

- **`OnboardingNotCompletedGuard`**: Permite acceso solo si el onboarding **NO está completado**
  - Aplicado a: `/start`, `/parental`, `/stage-details`, `/learning-topics`
  
- **`OnboardingCompletedGuard`**: Permite acceso solo si el onboarding **está completado**
  - Aplicado a: `/me`, `PATCH /me`

---

## 📝 Notas de Implementación

- El `userType` determina qué flujo seguir
- El `currentStage` determina qué campos son válidos en `/stage-details`
- No enviar campos que no correspondan a tu etapa resultará en error `400 Bad Request`
- El flujo es **secuencial**: debes completar cada paso antes del siguiente


