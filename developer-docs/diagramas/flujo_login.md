# Diagrama de Secuencia — Login

```mermaid
sequenceDiagram
    actor U as Usuario
    participant LP as LoginPage
    participant ZV as Zod Validation
    participant LM as useLogin (mutation)
    participant AS as auth.service.ts
    participant AX as Axios Interceptor
    participant BE as AuthController
    participant SV as AuthService
    participant NR as NodeRouterService
    participant DB as PostgreSQL (3 nodos)
    participant JWT as JwtService
    participant ST as authStore (Zustand)
    participant SS as sessionStorage
    participant RR as React Router

    U->>LP: Ingresa email + password
    LP->>ZV: safeParse({ email, password })
    alt Validación falla
        ZV-->>LP: errors por campo
        LP-->>U: Muestra errores inline
    end
    ZV-->>LP: success: true
    LP->>LM: mutate({ email, password })
    LM->>AS: login(email, password)
    AS->>AX: POST /api/auth/login { email, password }

    Note over AX: Sin Bearer token (ruta pública)

    AX->>BE: POST /api/auth/login
    BE->>SV: login(email, password)
    SV->>NR: getAllNodes()
    NR-->>SV: [prismaA, prismaB, prismaC]

    loop Buscar en cada nodo
        SV->>DB: findUnique({ email })
        alt Encontrado
            DB-->>SV: customer record
        else No encontrado
            DB-->>SV: null (sigue al siguiente)
        end
    end

    alt Customer no encontrado
        SV-->>BE: throw UnauthorizedException("Credenciales inválidas")
        BE-->>AX: 401
        AX-->>LM: AxiosError
        LM-->>LP: onError
        LP-->>U: "Credenciales inválidas"
    end

    SV->>SV: bcrypt.compare(password, hash)
    alt Password inválido
        SV-->>BE: throw UnauthorizedException("Credenciales inválidas")
        BE-->>AX: 401
    end

    SV->>JWT: sign({ sub: customer_id, role: "customer" })
    JWT-->>SV: access_token (1h TTL)
    SV-->>BE: { access_token, customer_id, role, expires_in: 3600 }
    BE-->>AX: 200 OK
    AX-->>AS: response.data
    AS-->>LM: AuthResponse

    LM->>ST: login(token, customerId, role)
    ST->>SS: setItem("token", token)
    ST->>SS: setItem("customerId", "27")
    ST->>SS: setItem("role", "customer")
    LM->>RR: navigate("/")
    RR-->>U: Renderiza HomePage
```

## Notas

- La búsqueda de email es **secuencial** por los 3 nodos (`auth.service.ts:36-41`). Esto significa que el nodo donde reside el cliente afecta la latencia de login.
- El token JWT tiene TTL de 1 hora. No hay refresh token implementado — al expirar, el usuario debe volver a loguearse.
- `sessionStorage` persiste el estado solo durante la sesión del navegador (se pierde al cerrar la pestaña).
