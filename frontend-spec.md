# OSU Record Store — Frontend Specification

## 1. Overview

This document specifies the administrator-facing frontend UI for the OSU Record Store database. The interface is accessible only via VPN. No authentication, session management, or persistent client-side state is required.

The current iteration requires all pages to be navigable and visually complete. No backend requests will be made; form submissions will be handled with a browser `alert()` until a backend is connected.

## 2. Architecture

**Type:** Multi-Page Application (MPA)

Each screen is a discrete HTML file served statically. Handlebars (`.hbs`) is used for templating — primarily for injecting mock data, rendering lists, and conditionally showing form state (create vs. edit). Navigation between screens is accomplished via standard anchor links.

### Page Inventory

| Screen            | File                     |
|-------------------|--------------------------|
| Artists — List    | `artists.html`           |
| Artists — Create  | `artists-create.html`    |
| Artists — Edit    | `artists-edit.html`      |
| Genres — List     | `genres.html`            |
| Genres — Create   | `genres-create.html`     |
| Genres — Edit     | `genres-edit.html`       |
| Customers — List  | `customers.html`         |
| Customers — Create| `customers-create.html`  |
| Customers — Edit  | `customers-edit.html`    |
| Items — List      | `items.html`             |
| Items — Create    | `items-create.html`      |
| Items — Edit      | `items-edit.html`        |
| Orders — List     | `orders.html`            |
| Orders — Create   | `orders-create.html`     |
| Orders — Edit     | `orders-edit.html`       |

## 3. Tech Stack

| Concern      | Technology                          |
|--------------|-------------------------------------|
| Markup       | Plain HTML5                         |
| Templating   | Handlebars.js                       |
| Styling      | Tailwind CSS (CDN)                  |
| Scripting    | Vanilla JavaScript (no framework)   |

## 4. Global Layout

All pages share an identical two-part chrome: a top header and a left-hand navigation sidebar. The main content area renders to the right of the sidebar.

### 4.1 Header

- Spans the full width of the viewport at the top of every page.
- Displays the text: **"OSU Record Store Database Dashboard"**
- Always visible; does not scroll with page content.

### 4.2 Left-Hand Navigation Menu

- Fixed sidebar, visible on all pages including create and edit screens.
- Lists each managed entity as a navigation link:
  - Artists
  - Genres
  - Customers
  - Items
  - Orders
- Clicking any item navigates to that entity's **List** screen (e.g., `artists.html`).
- The currently active section should be visually distinguished (e.g., highlighted or bolded).

### 4.3 Layout Structure (Conceptual)

```plaintext
┌──────────────────────────────────────────────────────┐
│  Header: OSU Record Store Database Dashboard         │
├────────────┬─────────────────────────────────────────┤
│ Sidebar    │  Main Content Area                      │
│ - Artists  │                                         │
│ - Genres   │                                         │
│ - Customers│                                         │
│ - Items    │                                         │
│ - Orders   │                                         │
└────────────┴─────────────────────────────────────────┘
```

## 5. Shared Patterns

### 5.1 List (Read) Screens

All list screens follow this structure:

1. **Page title** — entity name (e.g., "Artists").
2. **"Create +" button** — positioned above the table. Links to the entity's create screen.
3. **Data table** — an HTML `<table>` with:
   - A header row with human-readable column names.
   - One row per database record.
   - Resolved values for all foreign key columns (see §6 for per-entity rules).
   - An **Actions** column on each row containing:
     - **Edit** button — links to the entity's edit screen, passing the record's ID.
     - **Delete** button — triggers a `confirm()` dialog before proceeding (see §5.4).
4. **Empty state** — if no records exist, the table body displays a single full-width row with the message: `"No records found."`

### 5.2 Create Screens

1. **Page title** — e.g., "Create Artist".
2. **Form** containing one field per editable attribute (see per-entity specs in §6).
3. **Submit button** — on click, displays a browser `alert()` with the serialized form data. No HTTP request is made.

### 5.3 Edit Screens

1. **Page title** — e.g., "Edit Artist".
2. **Form** identical to the create screen, with all fields **pre-populated** with the record's current values via Handlebars.
3. **Submit button** — same `alert()` behavior as create, until the backend is connected.

> Fields that are display-only (not editable) are rendered as styled read-only text elements, visually distinct from input fields (e.g., using a muted background with no border). They are not `<input>` elements and must not be submitted as form data.

### 5.4 Delete Behavior

- Clicking the **Delete** button shows a browser `confirm()` dialog:
  > `"Are you sure you want to delete this [entity]? This action cannot be undone."`
- If the user confirms, the deletion is handled (currently a no-op until the backend is connected).
- If the user cancels, no action is taken.

> **Future implementation note (inline in delete handler JS):** Deleting certain records may violate foreign key constraints on the backend (e.g., deleting an Artist that has associated Items, or an Item referenced by OrderItems). When the backend is integrated, the delete handler should surface a user-friendly error message if the server responds with a constraint violation, rather than allowing a silent failure.

### 5.5 Form Submission Behavior (No Backend)

Until a backend is connected, all form submissions will:

1. Prevent the default form submission (`event.preventDefault()`).
2. Collect and serialize the form data.
3. Display the data in a `window.alert()`.

## 6. Entity Specifications

### 6.1 Artists

**Attributes:** `artistId`, `name`, `country`, `bio`

#### List Screen (`artists.html`)

| Column     | Source          | Notes                  |
|------------|-----------------|------------------------|
| Artist ID  | `artistId`      |                        |
| Name       | `name`          |                        |
| Country    | `country`       |                        |
| Bio        | `bio`           |                        |
| Actions    | —               | Edit, Delete buttons   |

#### Create Screen (`artists-create.html`)

| Field   | Input Type | Required | Notes         |
|---------|------------|----------|---------------|
| Name    | `text`     | Yes      |               |
| Country | `text`     | No       |               |
| Bio     | `textarea` | No       |               |

#### Edit Screen (`artists-edit.html`)

Same fields as Create, pre-populated with existing values. `artistId` is not shown as a form field.

### 6.2 Genres

**Attributes:** `genreId`, `name`, `description`

#### List Screen (`genres.html`)

| Column      | Source        | Notes                |
|-------------|---------------|----------------------|
| Genre ID    | `genreId`     |                      |
| Name        | `name`        |                      |
| Description | `description` |                      |
| Actions     | —             | Edit, Delete buttons |

#### Create Screen (`genres-create.html`)

| Field       | Input Type | Required | Notes |
|-------------|------------|----------|-------|
| Name        | `text`     | Yes      |       |
| Description | `textarea` | No       |       |

#### Edit Screen (`genres-edit.html`)

Same fields as Create, pre-populated. `genreId` is not shown as a form field.

### 6.3 Customers

**Attributes:** `customerId`, `firstName`, `lastName`, `email`, `shippingAddress`

#### List Screen (`customers.html`)

| Column           | Source            | Notes                |
|------------------|-------------------|----------------------|
| Customer ID      | `customerId`      |                      |
| First Name       | `firstName`       |                      |
| Last Name        | `lastName`        |                      |
| Email            | `email`           |                      |
| Shipping Address | `shippingAddress` |                      |
| Actions          | —                 | Edit, Delete buttons |

#### Create Screen (`customers-create.html`)

| Field            | Input Type | Required | Notes |
|------------------|------------|----------|-------|
| First Name       | `text`     | Yes      |       |
| Last Name        | `text`     | Yes      |       |
| Email            | `text`     | Yes      |       |
| Shipping Address | `textarea` | Yes      |       |

#### Edit Screen (`customers-edit.html`)

Same fields as Create, pre-populated. `customerId` is not shown as a form field.

### 6.4 Items

**Attributes:** `itemId`, `type`, `title`, `price`, `description`, `image`, `artistId` (FK → Artists), `genreId` (FK → Genres)

#### List Screen (`items.html`)

| Column      | Source        | Notes                                  |
|-------------|---------------|----------------------------------------|
| Item ID     | `itemId`      |                                        |
| Type        | `type`        | Display as-is (`record` or `CD`)       |
| Title       | `title`       |                                        |
| Price       | `price`       | Formatted as currency (e.g., `$24.99`) |
| Description | `description` |                                        |
| Image       | `image`       | Display filename string only           |
| Artist      | `artistId`    | Resolved to artist `name`              |
| Genre       | `genreId`     | Resolved to genre `name`               |
| Actions     | —             | Edit, Delete buttons                   |

#### Create Screen (`items-create.html`)

| Field       | Input Type              | Required | Notes                                                                                                       |
|-------------|-------------------------|----------|-------------------------------------------------------------------------------------------------------------|
| Type        | Radio buttons           | Yes      | Options: `record`, `CD`                                                                                     |
| Title       | `text`                  | Yes      |                                                                                                             |
| Price       | `number` (step: `0.01`) | Yes      |                                                                                                             |
| Description | `textarea`              | No       |                                                                                                             |
| Image       | `file`                  | No       | Accept image types. Only the filename will eventually be sent to the backend; file storage is out of scope. |
| Artist      | `select`                | Yes      | Dropdown populated with all artists; displays artist `name`                                                 |
| Genre       | `select`                | Yes      | Dropdown populated with all genres; displays genre `name`                                                   |

#### Edit Screen (`items-edit.html`)

Same fields as Create, pre-populated with existing values. `itemId` is not shown as a form field. The radio button for `type` should reflect the current value. The artist and genre dropdowns should have the current values pre-selected. The image field cannot be pre-populated (browser file input restriction); the current filename is displayed as read-only text alongside the file input.

### 6.5 Orders

**Attributes:** `orderId`, `customerId` (FK → Customers), `statusId` (FK → Statuses), `orderTimestamp` (backend-set), `orderTotal` (backend-calculated)

Orders also have associated **Order Items**, which are managed inline on the create and edit screens.

#### List Screen (`orders.html`)

| Column          | Source           | Notes                                                  |
|-----------------|------------------|--------------------------------------------------------|
| Order ID        | `orderId`        |                                                        |
| Customer        | `customerId`     | Resolved to customer full name (`firstName lastName`)  |
| Status          | `statusId`       | Resolved to status `statusCode`                        |
| Order Timestamp | `orderTimestamp` | Display as formatted datetime                          |
| Order Total     | `orderTotal`     | Formatted as currency (e.g., `$53.99`)                 |
| Actions         | —                | Edit, Delete buttons                                   |

> **Delete note:** Deleting an order must also delete its associated order items. When the backend is integrated, the delete operation should either cascade automatically via the database, or the frontend should issue order item deletions before deleting the order.

#### Create Screen (`orders-create.html`)

**Order Fields:**

| Field           | Input Type        | Required | Notes                                                                              |
|-----------------|-------------------|----------|------------------------------------------------------------------------------------|
| Customer        | `select`          | Yes      | Dropdown displaying `"First Last — email"` for each customer                       |
| Status          | `select`          | Yes      | Dropdown populated with all statuses; displays `statusCode`                        |
| Order Timestamp | Read-only display | —        | Display-only. Not user-editable. The backend will set this on create.              |
| Order Total     | Read-only display | —        | Display-only. Dynamically calculated from order items (see §6.5.1). Not submitted. |

**Order Items Inline Table** (see §6.5.1 below)

#### Edit Screen (`orders-edit.html`)

Same fields as Create, pre-populated. `orderId` is not shown as a form field. Customer and Status dropdowns have current values pre-selected. `orderTimestamp` is displayed with its stored value. `orderTotal` is dynamically calculated from the pre-loaded order items.

#### 6.5.1 Order Items Inline Table

The Order Items table is embedded within both the Orders create and edit screens. It allows the administrator to manage the items belonging to an order in a single submit action.

**Table Structure:**

| Column     | Input Type              | Editable | Notes                                                                                                          |
|------------|-------------------------|----------|----------------------------------------------------------------------------------------------------------------|
| Item       | `select`                | Yes      | Dropdown populated with all items; displays item `title`                                                       |
| Quantity   | `number` (min: `1`)     | Yes      |                                                                                                                |
| Price      | Read-only display       | No       | Derived from selected item's `price`. Styled distinctly from input fields (e.g., muted background, no border). |
| Line Total | Read-only display       | No       | Calculated as `price × quantity`. Updated dynamically. Styled distinctly.                                      |
| Remove     | Button                  | —        | Removes the row from the table. Does not require a separate confirm dialog.                                    |

**Table Actions:**

- **"Add Item" button** — below the table. Appends a new empty row to the order items table.
- All order item rows are submitted together with the main order **Submit** button. There are no per-row save actions.

**Dynamic Calculations:**

- **Price** (per row): When the Item dropdown changes, the Price cell updates to reflect the selected item's current price. This is for display only; the backend will derive the authoritative price.
- **Line Total** (per row): Recalculated as `price × quantity` whenever either the item selection or quantity changes.
- **Order Total** (order form): Recalculated as the sum of all rows' `lineTotal` values whenever any order item changes. Displayed in the Order Total read-only field. This is for display only; the backend will calculate the authoritative total.

**Empty State:**

If no order items have been added, the table body displays:
> `"No order items added yet."`

**On create:** The table starts empty. The administrator adds items before submitting.

**On edit:** The table is pre-populated with the order's existing order items, including their pre-selected item dropdowns and quantities.

> **Future implementation note (inline in order item JS):** When the backend is connected, each order item may need to be submitted individually (as INSERT/UPDATE/DELETE operations on `OrderItems`) rather than as part of a single order payload, depending on the API design. The submission handler should be designed with this in mind.

## 7. Field Type Reference

| Entity    | Attribute          | Input Type              | Notes                                                  |
|-----------|--------------------|-------------------------|--------------------------------------------------------|
| Artists   | name               | `text`                  |                                                        |
| Artists   | country            | `text`                  |                                                        |
| Artists   | bio                | `textarea`              |                                                        |
| Genres    | name               | `text`                  |                                                        |
| Genres    | description        | `textarea`              |                                                        |
| Customers | firstName          | `text`                  |                                                        |
| Customers | lastName           | `text`                  |                                                        |
| Customers | email              | `text`                  | Consider `type="email"` for validation                 |
| Customers | shippingAddress    | `textarea`              |                                                        |
| Items     | type               | Radio buttons           | Options: `record`, `CD`                                |
| Items     | title              | `text`                  |                                                        |
| Items     | price              | `number` (step: `0.01`) |                                                        |
| Items     | description        | `textarea`              |                                                        |
| Items     | image              | `file`                  | Filename only sent to backend; storage is out of scope |
| Items     | artistId           | `select`                | Display artist `name`                                  |
| Items     | genreId            | `select`                | Display genre `name`                                   |
| Orders    | customerId         | `select`                | Display `"First Last — email"`                         |
| Orders    | statusId           | `select`                | Display status `statusCode`                            |
| Orders    | orderTimestamp     | Read-only display       | Backend-set; not submitted                             |
| Orders    | orderTotal         | Read-only display       | Dynamically calculated; not submitted                  |
| OrderItems| itemId             | `select`                | Display item `title`                                   |
| OrderItems| quantity           | `number` (min: `1`)     |                                                        |
| OrderItems| price              | Read-only display       | Derived from item; not submitted                       |
| OrderItems| lineTotal          | Read-only display       | Calculated as `price × quantity`; not submitted        |

## 8. Data Resolution Rules

When displaying foreign key values in tables or pre-populating dropdowns, the following resolved values must be used:

| Entity      | FK Column    | Displayed As                                                             |
|-------------|--------------|--------------------------------------------------------------------------|
| Items       | `artistId`   | Artist `name`                                                            |
| Items       | `genreId`    | Genre `name`                                                             |
| Orders      | `customerId` | `"firstName lastName"` (list), `"firstName lastName — email"` (dropdown) |
| Orders      | `statusId`   | Status `statusCode`                                                      |
| OrderItems  | `itemId`     | Item `title`                                                             |

> In the no-backend phase, resolved values are rendered directly into Handlebars templates using mock data. When the backend is connected, resolved values should come from JOIN queries or separate API lookups.

## 9. Out of Scope

The following items are explicitly out of scope for this iteration:

- Authentication, login, or session management (VPN access assumed).
- Pagination on list screens (can be added in the future).
- Image file upload / storage (only the filename string will eventually be sent).
- FK cascade warnings in the delete flow (documented inline in source; to be implemented with the backend).
- Status CRUD (Statuses are seeded once and not managed via the UI).
- Image preview on Items edit screen.
