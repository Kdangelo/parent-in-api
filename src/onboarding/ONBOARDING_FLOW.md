# 📊 Onboarding Flow - Parent-in API

## Descripción General

El flujo de onboarding de Parent-in consta de **3 pasos principales**:

1. **Paso 1 (START)**: Datos generales del usuario
2. **Paso 2**: Datos específicos según tipo de usuario y etapa
3. **Paso 3**: Selección de temas de aprendizaje (finalización)

---

## 🔄 Flujo Detallado

┌─────────────────────────────────────────────────────────────────────────────────┐
│ ONBOARDING FLOW - PARENT-IN API │
└─────────────────────────────────────────────────────────────────────────────────┘

┌──────────────────┐
│ PASO 1: START │
│ POST /start │
│ (UserDataDto) │
├──────────────────┤
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
┌───────────────────────┐
│ PASO 2-FINAL: │
│ PUT /stage-details │
│ (StageDetailsDto) │
└───────────────────────┘
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
▼
┌─────────────────────────────┐
│ PASO 3: LEARNING TOPICS │
│ PUT /learning-topics │
│ (LearningTopicsDto) │
└─────────────────────────────┘
│
┌───────────┴──────────────┐
│ │
│ ALMACENA: │
│ • learningTopics[] │
│ (array de temas) │
│ │
│ ✅ FINALIZA │
│ is_onboarding_ │
│ completed = TRUE │
│ │
└──────────────────────────┘



---

## 📋 Resumen de Endpoints

| Paso | Endpoint | Método | DTOs | Descripción |
|------|----------|--------|------|-------------|
| **1** | `/onboarding/start` | `POST` | `UserDataDto` | Datos generales (ciudad, país, género, teléfono, tipo de usuario) |
| **2a** | `/onboarding/parental` | `POST` | `ParentalUserDto` | Datos parentales (solo si `userType = parental`) |
| **2b** | `/onboarding/stage-details` | `PUT` | `StageDetailsDto` | Datos específicos según etapa (PRE_LICENSE, LICENSE, POST_LICENSE) |
| **3** | `/onboarding/learning-topics` | `PUT` | `LearningTopicsDto` | Temas de aprendizaje y **finalización** del onboarding |

---

## 🔑 Puntos Clave

### Paso 1: START
- Define el **tipo de usuario** (`userType`)
- Requerido para todos

### Paso 2A: PARENTAL (Solo usuarios parentales)
- Define la **etapa actual** (`currentStage`: PRE_LICENSE, LICENSE, POST_LICENSE)
- Almacena datos laborales y familiares

### Paso 2B: STAGE-DETAILS (Detalles por etapa)
- **Solo envía campos de tu etapa actual**:
  - **PRE_LICENSE**: `trimester`, `estimatedDueDate`, `preLicenseSupportNeeds`
  - **LICENSE**: `babyBirthDate`, `licenseDuration`, `licenseSupportNeeds`
  - **POST_LICENSE**: `returnDate`, `workModality`, `postLicenseSupportNeeds`

### Paso 3: LEARNING-TOPICS (Finalización)
- Selecciona temas de interés
- **Marca el onboarding como completado** (`is_onboarding_completed = TRUE`)

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


