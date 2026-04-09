# Requisitos del Sistema de Bases de Datos Distribuidas

Los siguientes requisitos definen las capacidades funcionales que el sistema debe garantizar desde la perspectiva del negocio financiero que modela. Cada requisito fue identificado a partir del análisis de los productos y operaciones que DistriBank busca representar —cuentas de débito, cuentas de crédito, instrumentos de pago asociados y el ciclo de vida completo de las transacciones— y establece el criterio observable contra el cual evaluar el comportamiento del sistema en su arquitectura distribuida. Dado que la fragmentación se realiza por `customer_id % 3` distribuyendo a los 30 clientes en tres nodos, varios de estos requisitos adquieren matices distintos respecto a un diseño centralizado, y esas tensiones se documentan explícitamente.

---

## Soporte para tarjetas de extensión en cuentas de crédito

Una cuenta de crédito debe poder tener asociados múltiples instrumentos de pago activos de forma simultánea, correspondientes al titular de la cuenta y a terceros autorizados por este —familiares o personas de confianza designadas por el cliente. Cada tarjeta de extensión opera sobre el mismo límite de crédito disponible de la cuenta principal, de modo que el consumo acumulado de todos los instrumentos activos se refleja de forma unificada en el estado de la cuenta.

Este requisito reconoce que el producto de crédito en instituciones de *retail financiero* como Coppel o Liverpool frecuentemente se comercializa como un producto familiar, donde el control del límite recae en la cuenta y no en el instrumento individual de pago. En la arquitectura distribuida, la coherencia de este requisito está garantizada siempre que las tarjetas de extensión y su cuenta raíz residan en el mismo nodo —condición que se cumple por diseño, ya que `cards` se fragmenta siguiendo a `accounts`, que a su vez sigue a `customers`.

---

## Reintento automático de transacciones fallidas

Cuando una transacción no puede completarse satisfactoriamente en su primer intento —ya sea por indisponibilidad temporal de algún componente del sistema, por condiciones de contención sobre los recursos involucrados, o por errores transitorios en la infraestructura— el sistema debe ser capaz de reintentar su ejecución de forma controlada, con un máximo de tres intentos antes de marcar la operación como definitivamente fallida. Cada intento debe ser trazable de forma individual, de modo que el historial de reintentos quede registrado y sea auditable.

Este requisito es especialmente relevante en el contexto de una arquitectura distribuida, donde la probabilidad de fallos parciales y transitorios es estructuralmente mayor que en un sistema centralizado, y donde la distinción entre un fallo permanente y uno recuperable tiene consecuencias directas sobre la experiencia del cliente y la consistencia del estado financiero. En transacciones *cross-nodo* —donde origen y destino pertenecen a clientes en nodos distintos— el reintento debe coordinarse con el patrón SAGA para evitar dobles débitos o estados parcialmente aplicados.

---

## Acceso inmediato a los detalles monetarios de las cuentas de un cliente

El sistema debe poder servir con baja latencia la información financiera esencial de un cliente —saldo disponible, límite de crédito autorizado, crédito disponible y límite de sobregiro, según el tipo de cuenta— sin necesidad de recorrer ni agregar información distribuida en múltiples nodos. Este requisito reconoce que las consultas de perfil financiero son el *path* de acceso más frecuente en operaciones de punto de venta, cajero automático y banca móvil, y que una degradación en su tiempo de respuesta tiene impacto directo sobre la disponibilidad percibida del servicio.

En la arquitectura distribuida de DistriBank, este requisito se satisface de forma natural: dado que la fragmentación por `customer_id % 3` coloca a un cliente y todas sus cuentas en el mismo nodo, la consulta de perfil financiero es siempre local al nodo propietario. La tensión surge únicamente en transacciones *cross-nodo*, donde el nodo receptor debe verificar el estado de una cuenta que no le pertenece —escenario que expone deliberadamente el problema de *read-your-writes consistency* y la necesidad de coordinación inter-nodo.

---

## Trazabilidad completa del flujo monetario en cada transacción

Cada operación financiera registrada en el sistema debe preservar de forma explícita e inmutable la identidad de la cuenta de origen y la cuenta de destino, de modo que sea posible reconstruir con precisión el recorrido del valor monetario en cualquier momento posterior a la ejecución. Esta trazabilidad debe mantenerse tanto para transacciones completadas exitosamente como para aquellas que resultaron en fallo o fueron objeto de compensación.

En el contexto distribuido, este requisito introduce una complejidad adicional: una transacción *cross-nodo* genera entradas en el `transaction_log` de dos nodos distintos. La reconstrucción completa del ciclo de vida de esa transacción requiere correlacionar los logs de ambos nodos mediante el `transaction_uuid`, que actúa como identificador global. El diseño actual garantiza esta trazabilidad siempre que el `transaction_uuid` sea propagado consistentemente a todos los nodos participantes en la operación.

---

## Vinculación de tarjetas disponible el mismo día de la solicitud

Cuando un cliente solicita la emisión de una nueva tarjeta —ya sea como instrumento principal, de extensión, o de reemplazo— la vinculación de dicha tarjeta con la cuenta correspondiente y su habilitación para operar en transacciones deben completarse dentro del mismo día calendario en que se origina la solicitud.

En la arquitectura distribuida de DistriBank, este requisito se cumple sin fricción adicional para el caso nominal: dado que `cards` y `accounts` residen en el mismo nodo que su cliente propietario, la operación de vinculación es una escritura local. La complejidad surge únicamente si el nodo primario del cliente no responde y la escritura debe redirigirse al schema VIP de Nodo C —escenario que introduce la problemática de *read-your-writes consistency* en el modo de *failover* con reconciliación diferida.

---

## Control de estado operativo de tarjetas

El sistema debe permitir modificar el estado operativo de una tarjeta —habilitarla o deshabilitarla para la realización de transacciones— de forma que el efecto sea consistente e inmediatamente aplicable sobre cualquier intento de pago posterior a la modificación. Una tarjeta deshabilitada no debe poder ser utilizada como instrumento válido en ninguna transacción mientras permanezca en ese estado, independientemente del canal por el que se origina la operación.

En la arquitectura distribuida, este requisito se satisface localmente en el caso nominal: el estado canónico de una tarjeta reside en el nodo propietario del cliente, y toda operación de autorización que involucre esa tarjeta debe consultar ese nodo. La tensión aparece en el modo de *failover* cuando el estado de una tarjeta ha sido modificado sobre el schema VIP de Nodo C pero el nodo primario aún no ha sido reconciliado —período durante el cual el estado de la tarjeta en el primario y en la réplica puede divergir. Este escenario constituye uno de los problemas de *write conflict* que el diseño busca hacer observables.

---

## Consistencia eventual de la réplica VIP

El schema `distribank_vip_customers` en Nodo C consolida a todos los clientes clasificados como *VIP* —aquellos cuya suma de `week_transactions` sobre cuentas activas alcanza o supera 3— provenientes de los tres nodos. La sincronización ocurre cada 6–8 horas en operación normal, y el predicado VIP se reevalúa en cada ciclo, permitiendo la entrada y salida dinámica del schema.

Este diseño introduce deliberadamente una ventana de inconsistencia: durante el intervalo entre ciclos de sincronización, el estado del schema VIP puede no reflejar las transacciones más recientes del nodo primario. El sistema no garantiza consistencia fuerte sobre la réplica VIP —garantiza *consistencia eventual*— y esta limitación debe ser documentada y aceptada como trade-off académico explícito. El requisito establece que el sistema debe exponer esta ventana de inconsistencia de forma observable mediante el `transaction_log`, permitiendo auditar qué operaciones fueron realizadas sobre la réplica en modo *failover* y cuáles están pendientes de reconciliación.
