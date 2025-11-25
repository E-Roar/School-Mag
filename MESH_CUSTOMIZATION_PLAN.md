# 📐 Mesh Geometry Customization Plan

This document outlines the plan to allow admins to customize the book mesh geometry (bending, curve strength, animation speed) for each issue individually.

## 1. Database Schema Update

We need to store the mesh settings for each book. The best approach is to add a `mesh_settings` JSONB column to the `books` table. This allows for flexibility if we add more parameters later.

**SQL Migration:**
```sql
ALTER TABLE books ADD COLUMN mesh_settings JSONB DEFAULT '{
  "insideCurveStrength": 0.18,
  "outsideCurveStrength": 0.05,
  "turningCurveStrength": 0.09,
  "easingFactor": 0.5,
  "roughness": 0.4
}';
```

## 2. Admin UI Implementation

We will add a new tab "Mesh / 3D" to the `IssueDetails` or `SettingsPanel` component.

**Controls to Add:**
- **Spine Curve (Inside Strength):** Slider (0.0 to 0.5). Controls how much the page bends near the spine.
  - *Lower value = Flatter page*
- **Edge Curve (Outside Strength):** Slider (0.0 to 0.2). Controls the curl at the edge of the page.
  - *Lower value = Flatter edge*
- **Turning Bend:** Slider (0.0 to 0.3). Controls how much the page bends while turning.
  - *Lower value = Stiffer page turn*
- **Animation Speed:** Slider (0.1 to 1.0). Controls how fast the page turns.
- **Paper Roughness:** Slider (0.0 to 1.0). Controls shininess (0 = Glossy, 1 = Matte).

## 3. Component Updates

### `src/components/Book.jsx`

Currently, these values are hardcoded constants:
```javascript
const easingFactor = 0.5;
const insideCurveStrength = 0.18;
const outsideCurveStrength = 0.05;
const turningCurveStrength = 0.09;
```

**Changes Required:**
1.  Update the `Book` component to accept a `meshSettings` prop.
2.  Use these props instead of the constants in the `useFrame` loop.
3.  Pass `roughness` from `meshSettings` to the material definitions.

**Example Code Structure:**
```javascript
const Book = ({ meshSettings = defaultMeshSettings, ...props }) => {
  // ...
  useFrame((_, delta) => {
    // ...
    const { insideCurveStrength, outsideCurveStrength, turningCurveStrength } = meshSettings;
    
    let rotationAngle =
      insideCurveStrength * insideCurveIntensity * targetRotation -
      outsideCurveStrength * outsideCurveIntensity * targetRotation +
      turningCurveStrength * turningIntensity * targetRotation;
    // ...
  });
}
```

### `src/components/BookScene.jsx` & `src/routes/IssueViewer.jsx`

-   Pass the `book.mesh_settings` data down from the `BookDataContext` -> `IssueViewer` -> `BookScene` -> `Book`.

## 4. Implementation Steps

1.  **Run SQL Migration**: Add the column to Supabase.
2.  **Update Data Context**: Ensure `fetchBooks` retrieves the new column.
3.  **Update Book Component**: Refactor to use props for geometry math.
4.  **Build Admin UI**: Create the sliders and save logic in the admin panel.
5.  **Test**: Verify that changing sliders in Admin immediately affects the book preview (if possible) or after save.

## 5. "Less Bending" Configuration

To achieve the "less bending" look the user requested, the admin would set:
-   **Spine Curve**: ~0.05 (vs default 0.18)
-   **Edge Curve**: ~0.01 (vs default 0.05)
-   **Turning Bend**: ~0.05 (vs default 0.09)

This will make the pages appear much stiffer and flatter, like thick cardstock or a hardbound book.
