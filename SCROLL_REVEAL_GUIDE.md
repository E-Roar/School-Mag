# 🎨 Scroll Reveal Animation Guide

## How to Use in LandingPage.jsx

The `ScrollReveal` component wraps any content and animates it when scrolled into view.

### Basic Usage

```jsx
import { ScrollReveal } from "../hooks/useScrollReveal";

<ScrollReveal animation="pop">
  <div className="neo-card">
    Your content here
  </div>
</ScrollReveal>
```

### Animation Types

1. **`pop`** (default) - 3D popping effect (recommended for neomorphic design)
2. **`slide-up`** - Slides up from bottom
3. **`slide-left`** - Slides in from left
4. **`slide-right`** - Slides in from right
5. **`fade`** - Simple fade in
6. **`scale`** - Scale from small to normal
7. **`extrude`** - 3D extrude with enhanced shadows

### Props

- `animation`: Type of animation (default: "pop")
- `delay`: Delay in ms before animation starts (default: 0)
- `duration`: Animation duration in ms (default: 600)
- `className`: Additional CSS classes

### Recommended Sections to Wrap

#### 1. Hero Section Content
```jsx
<ScrollReveal animation="extrude" duration={800}>
  <div className="w-full md:w-1/2 space-y-8...">
    {/* Hero text content */}
  </div>
</ScrollReveal>

<ScrollReveal animation="pop" delay={200}>
  <div className="w-full md:w-1/2...">
    {/* Latest book cover */}
  </div>
</ScrollReveal>
```

#### 2. About Section Cards
```jsx
{/* Wrap each feature card */}
<ScrollReveal animation="pop" delay={0}>
  <div className="text-center space-y-4...">
    🚀 Innovation
  </div>
</ScrollReveal>

<ScrollReveal animation="pop" delay={100}>
  <div className="text-center space-y-4...">
    🎨 Creativity
  </div>
</ScrollReveal>

<ScrollReveal animation="pop" delay={200}>
  <div className="text-center space-y-4...">
    🌍 Community
  </div>
</ScrollReveal>
```

#### 3. Library Section
```jsx
<ScrollReveal animation="slide-up">
  <div className="flex flex-col md:flex-row...">
    {/* Section header */}
  </div>
</ScrollReveal>

{/* Wrap book grid */}
<ScrollReveal animation="fade" duration={1000}>
  <div className="grid grid-cols-1 sm:grid-cols-2...">
    {/* Books */}
  </div>
</ScrollReveal>
```

#### 4. Individual Book Cards
```jsx
{filteredBooks.map((book, index) => (
  <ScrollReveal 
    key={book.id}
    animation="extrude"
    delay={index * 50} // Stagger effect
    duration={600}
  >
    <Link to={`/view/${book.id}`}>
      {/* Book card */}
    </Link>
  </ScrollReveal>
))}
```

#### 5. Suggestions Form
```jsx
<ScrollReveal animation="extrude" duration={800}>
  <div className="neo-card p-8 md:p-12...">
    {/* Feedback form */}
  </div>
</ScrollReveal>
```

## Key Features

### ✅ Replay Animation
- Animates IN when scrolled into view
- Animates OUT when scrolled out of view
- **Replays every time** - no page refresh needed!

### ✅ Intersection Observer
- Uses modern browser API
- Performant and smooth
- Customizable thresholds

### ✅ 3D Extrude Effect
- Special neomorphic animation
- Enhanced shadows when visible
- Gives depth and dimension

## Example: Complete Hero Section

```jsx
<section id="hero" className="flex flex-col md:flex-row items-center gap-12 md:gap-20 min-h-[60vh]">
  {/* Left Content */}
  <ScrollReveal animation="slide-right" duration={800}>
    <div className="w-full md:w-1/2 space-y-8 text-center md:text-left order-2 md:order-1">
      <ScrollReveal animation="pop" delay={200}>
        <div className="inline-block px-4 py-1 rounded-full...">
          <span>Welcome to the Future</span>
        </div>
      </ScrollReveal>
      
      <ScrollReveal animation="pop" delay={400}>
        <h2 className="text-5xl md:text-7xl font-bold...">
          Read. <span>Experience.</span> Inspire.
        </h2>
      </ScrollReveal>
      
      <ScrollReveal animation="pop" delay={600}>
        <p className="text-lg text-gray-500...">
          {settings.school_description}
        </p>
      </ScrollReveal>
      
      <ScrollReveal animation="pop" delay={800}>
        <div className="flex flex-wrap items-center...">
          {/* Buttons */}
        </div>
      </ScrollReveal>
    </div>
  </ScrollReveal>

  {/* Right Content - Book Cover */}
  <ScrollReveal animation="extrude" delay={300} duration={1000}>
    <div className="w-full md:w-1/2 flex justify-center...">
      {latestBook && (
        <div className="relative w-64 md:w-80 aspect-[3/4]...">
          {/* Book cover */}
        </div>
      )}
    </div>
  </ScrollReveal>
</section>
```

## Performance Tips

1. **Don't wrap tiny elements** - Only wrap significant sections/cards
2. **Use delays for stagger effect** - Makes it feel more natural
3. **Limit nesting** - Don't wrap ScrollReveal inside ScrollReveal
4. **Longer duration for larger elements** - 600-1000ms for big sections

## Browser Support

- ✅ Chrome/Edge (Modern)
- ✅ Firefox
- ✅ Safari
- ✅ Mobile browsers
- ⚠️ Falls back gracefully in old browsers (just shows content)

---

**Try it out!** Scroll up and down the page to see animations replay! 🎉
