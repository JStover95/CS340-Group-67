<!-- Date: 05/06/2026
 AI tools were used to generate this code (Cursor Composer 2).

 Summary of prompts:
 - Prompted for design of an administrator-facing frontend specification in `frontend-spec.md` using `database-outline.md` as the source of schema and relationship requirements.
 - Prompted for enforcement of scope constraints: VPN-only access, no authentication/session state, no backend requests, and alert-based no-op submit behavior.
 - Prompted for coverage of full CRUD UI requirements for `Artists`, `Genres`, `Customers`, `Items`, and `Orders`, with `Statuses` excluded from CRUD management.
 - Prompted for clarification and confirmation of UI/UX decisions, including MPA architecture, `Items.type` radio inputs, `Customers.shippingAddress` textarea usage, and header text selection.
 - Prompted for inclusion of relationship-driven UI behavior: artist/genre dropdowns on items, customer/status dropdowns on orders, and inline editable order items table on order create/edit pages.
 - Prompted for treatment of derived/display-only order fields (`orderTimestamp`, `orderTotal`, `OrderItems.price`, `OrderItems.lineTotal`) as non-editable with distinctive styling.
 - Prompted for read-table display normalization from IDs to human-readable values (customer name/status code in orders, artist/genre names in items).
 - Prompted for delete confirmation behavior via user confirmation dialogs, with FK/cascade warnings deferred out of scope but documented for future backend integration.
 - Prompted for explicit empty-state handling with `No records found.` messaging in list tables and no image preview requirement on item edit.
 - Prompted for implementation of the approved MPA plan end-to-end, with fake data loaded from `data/*.json` for read/edit rendering only, and create/update/delete behavior retained as no-op alert flows.
 - Prompted for todo-driven execution discipline: existing plan todos marked in progress/completed sequentially without recreating plan tasks.
 - Prompted for brief task-status communication when the smoke-test local server job ended in aborted state, with no further action required.
 - Prompted for final concise recap request for conversation prompts and requirement discussion points.
-->

# The OSU Record Store

## Outline

The OSU record store has been serving the OSU campus for over 20 years. After slowing business due to online streaming, the store has seen renewed growth in the past year amidst a wave of interest in vinyl records. They have been recording an average of 30 records and 20 CDs sold per day, and have a projected gross revenue of $300,000 for the following year.

The OSU record store wants to open an online shop to handle the new volume of sales and expand its business. In the online store they will offer their full catalog of vinyl records and CDs. According to a recent regional survey, the OSU Record Store is expecting to have 500-600 unique monthly active users. It is expected that the volume of online sales will require the store to have on hand inventory for up to 100 unique sales per day.

After creating an account, customers can search for albums by artist, genre, and title. Orders can be made directly through the online store with the customer’s saved payment method. When making an order, a customer can select one or more items (records or CDs), each with a quantity for that order. Order will have one of four statuses: in progress, ordered, en route, and shipped. The order’s status allows the custom to track the progress of their order.

The store manager also wants functionality that will allow them to track monthly sales. Transactions will be tracked historically in the database to allow for quick querying and analysis on a monthly basis.

## Database Outline

**Customers**
These are the customers who sign up on the online store. A customer must have an account before making any purchases. A customer’s payment methods are handled by a third-party provider.

Attributes:

* customerId: int, auto\_increment, unique, not NULL, PK
* firstName: varchar(100), not NULL
* lastName: varchar(100), not NULL
* email: varchar(100), not NULL
* shippingAddress: varchar(100), not NULL
* Relationship: A 1:M relationship between customers and orders. One customer can have zero or many orders, using customerId as a foreign key.

**Orders**
These are the orders being placed by our customers. An order’s status is used to track its progress. A timestamp for the order is recorded to allow for monthly analysis.

Attributes:

* orderId: int, auto\_increment, unique, not NULL, PK
* customerId: int, not NULL
* statusId: int, not NULL
* orderTimestamp: datetime, not NULL
* orderTotal: decimal(10,2), not NULL
* Relationship: A 1:M relationship between orders and customers. An order must have one customer.
* Relationship: A 1:M relationship between orders and statuses. An order must have one status.

**Statuses**
This is a category table for defining the different statuses an order can have. Each status has a code and a description

Attributes:

* statusId: int, auto\_increment, unique, not NULL, PK
* statusCode: varchar(50), not NULL
* description: varchar(1000), not NULL
* Relationship: A 1:M relationship between statuses and orders. A status can have zero or more orders, using statusId as a foreign key.

**OrderItems**
This is the junction table between orders and items to define the items that belong to an order and the quantity of each. A price attribute is included to record historical transaction prices for monthly analysis.

Attributes:

* orderItemId: int, auto\_increment, unique, not NULL, PK
* orderId: int, not NULL
* itemId: int, not NULL
* quantity: int, not NULL
* price: decimal(10,2), not NULL
* lineTotal: decima(10,2), not NULL
* Relationship: A 1:M relationship between orders and order items.
* Relationship: A 1:M relationship between orders and items.

**Items**
These are the various types of items that are sold on the online store, including records and CDs. Each must have one artist and one genre.

Attributes:

* itemId: int, auto\_increment, unique, not NULL, PK
* type (record, CD): enum (‘record’ , ‘CD’), not NULL
* title: varchar(255), not NULL
* price: decimal(10,2), not NULL
* description: varchar(1000), NULL
* image: varchar(255), NULL \- Stores the file path or URL to the items cover image
* artistId: int, not NULL, FK
* genreId: int, not NULL, FK
* Relationship: a 1:M relationship between artists and items is implemented, with artistId as an FK inside of items. An item must have one artist.
* Relationship: A 1:M relationship between genre and items is implemented, with genreId as an FK inside of items. An item must have one genre.
* Relationship: A M:M relationship between items and orders is implemented through the orderItems junction table. One item can appear in many orders, and one order can have many items.

**Artists**
These are the artists whose records or CDs are being sold at the store.

Attributes:

* artistId: int, auto\_increment, unique, not NULL, PK
* name: varchar(255), not NULL
* country: varchar(100), NULL
* bio: varchar(1000), NULL
* Relationship: a 1:M relationship between artists and items is implemented, with artistId as an FK inside of items.

**Genres**
These are the various genres of records or CDs being sold at the store.

Attributes:

* genreId: int, auto\_increment, unique, not NULL, PK
* name: varchar(100), not NULL
* description: varchar(1000), NULL
* Relationship: A 1:M relationship between genre and items is implemented, with genreId as an FK inside of items.

## Example Data

| Artists | :---- | :---- | :---- |
| ----- | :---- | :---- | :---- |
| **artistId** | **name** | **country** | **bio** |
| 1 | The Northern Lights | Canada | Indie rock quartet known for atmospheric live sessions. |
| 2 | Velvet Frequency | UK | Synthwave duo blending retro textures with modern pop hooks. |
| 3 | Sierra Blue | USA | Singer-songwriter with roots in folk and acoustic storytelling. |
| 4 | Monochrome Pulse | NULL | NULL |

| Customers | :---- | :---- | :---- | :---- |
| ----- | :---- | :---- | :---- | :---- |
| **customerId** | **firstName** | **lastName** | **email** | **shippingAddress** |
| 1 | Ava | Martinez | <ava.martinez@example.com> | 101 Maple St Portland OR |
| 2 | Liam | Nguyen | <liam.nguyen@example.com> | 202 Oak Ave Seattle WA |
| 3 | Noah | Johnson | <noah.johnson@example.com> | 303 Pine Rd Austin TX |
| 4 | Emma | Davis | <emma.davis@example.com> | 404 Cedar Ln Denver CO |
| 5 | Sophia | Brown | <sophia.brown@example.com> | 505 Birch Dr Miami FL |

| Genres | :---- | :---- |
| ----- | :---- | :---- |
| **genreId** | **name** | **description** |
| 1 | Indie Rock | Guitar-driven alternative rock with melodic emphasis. |
| 2 | Synthwave | Electronic style inspired by 1980s film and arcade soundtracks. |
| 3 | Folk | Acoustic arrangements centered on lyrical narratives. |
| 4 | Jazz | NULL |

| Items | :---- | :---- | ----- | :---- | :---- | ----- | ----- |
| ----- | :---- | :---- | ----- | :---- | :---- | ----- | ----- |
| **itemId** | **type** | **title** | **price** | **description** | **image** | **artistId** | **genreId** |
| 1 | record | Skylines at Dawn | 24.99 | Debut vinyl pressing with two bonus tracks | /images/skylines-at-dawn.jpg | 1 | 1 |
| 2 | CD | Neon Ghosts | 27.50 | Expanded CD edition with remix booklet | NULL | 2 | 2 |
| 3 | CD | Quiet Fires | 14.50 | NULL | /images/quiet-fires.jpg | 3 | 3 |
| 4 | record | Static Hearts | 12.00 | Limited run live session recording | /images/static-hearts.jpg | 2 | 2 |
| 5 | CD | Paper Trails | 18.00 | Acoustic EP with alternate takes | NULL | 3 | 3 |
| 6 | record | City Echoes | 31.25 | 180g audiophile pressing | /images/city-echoes.jpg | 1 | 1 |

| OrderItems | ----- | ----- | ----- | ----- | ----- |
| ----- | ----- | ----- | ----- | ----- | ----- |
| **orderItemId** | **orderId** | **itemId** | **quantity** | **price** | **lineTotal** |
| 1 | 1 | 1 | 1 | 24.99 | 24.99 |
| 2 | 1 | 3 | 2 | 14.50 | 29.00 |
| 3 | 2 | 2 | 1 | 27.50 | 27.50 |
| 4 | 2 | 5 | 1 | 18.00 | 18.00 |
| 5 | 3 | 4 | 3 | 12.00 | 36.00 |
| 6 | 4 | 6 | 1 | 31.25 | 31.25 |
| 7 | 5 | 3 | 1 | 13.99 | 13.99 |
| 8 | 5 | 1 | 2 | 22.49 | 44.98 |
| 9 | 6 | 2 | 2 | 26.00 | 52.00 |

| Orders | ----- | ----- | ----- | ----- |
| ----- | ----- | ----- | ----- | ----- |
| **orderId** | **customerId** | **statusId** | **timestamp** | **orderTotal** |
| 1 | 1 | 4 | 2026-03-14 10:15:00 | 53.99 |
| 2 | 1 | 3 | 2026-03-21 14:42:00 | 45.50 |
| 3 | 2 | 2 | 2026-04-02 9:05:00 | 36.00 |
| 4 | 3 | 4 | 2026-04-05 19:33:00 | 31.25 |
| 5 | 4 | 1 | 2026-04-12 11:20:00 | 58.97 |
| 6 | 2 | 2 | 2026-04-18 16:47:00 | 52.00 |

| Statuses | :---- | :---- |
| ----- | :---- | :---- |
| **statusId** | **statusCode** | **description** |
| 1 | IN\_PROGRESS | Order has been placed and is awaiting payment confirmation. |
| 2 | ORDERED | Payment has been received and order is queued for fulfillment. |
| 3 | EN\_ROUTE | Order has left the warehouse and is in transit. |
| 4 | SHIPPED | Order has been delivered to the customer. |
