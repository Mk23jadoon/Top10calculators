<?php
/**
 * Meta Tag Generator for Top10Calculators
 * Automatically generates SEO meta tags for all calculator pages
 */

class MetaTagGenerator {
    private $pageData;
    
    public function __construct() {
        $this->loadPageData();
    }
    
    private function loadPageData() {
        $this->pageData = [
            // Geometry & Math Calculators
            'geometrycalc' => [
                'title' => 'Geometry Calculator - Calculate Area, Perimeter & Volume',
                'description' => 'Free online geometry calculator for triangles, circles, rectangles, spheres, and cones. Calculate area, perimeter, volume, and surface area with step-by-step solutions.',
                'keywords' => 'geometry calculator, area calculator, perimeter calculator, volume calculator, triangle calculator, circle calculator, rectangle calculator',
                'type' => 'EducationApplication',
                'category' => 'Math & Science'
            ],
            
            'fractioncalc' => [
                'title' => 'Fraction Calculator - Add, Subtract, Multiply & Divide Fractions',
                'description' => 'Free fraction calculator for adding, subtracting, multiplying, and dividing fractions. Get step-by-step solutions and simplify fractions instantly.',
                'keywords' => 'fraction calculator, add fractions, subtract fractions, multiply fractions, divide fractions, fraction solver',
                'type' => 'EducationApplication',
                'category' => 'Math & Science'
            ],
            
            'trianglecalc' => [
                'title' => 'Triangle Calculator - Calculate Area, Perimeter & Angles',
                'description' => 'Free triangle calculator to find area, perimeter, angles, and sides. Supports right triangles, equilateral, isosceles, and scalene triangles.',
                'keywords' => 'triangle calculator, triangle area, triangle perimeter, right triangle calculator, angle calculator',
                'type' => 'EducationApplication',
                'category' => 'Math & Science'
            ],
            
            // Health Calculators
            'bmicalc' => [
                'title' => 'BMI Calculator - Calculate Body Mass Index Accurately',
                'description' => 'Free BMI calculator to measure body mass index. Get accurate results with BMI categories, healthy weight ranges, and health recommendations.',
                'keywords' => 'bmi calculator, body mass index, weight calculator, health calculator, bmi chart, healthy weight',
                'type' => 'HealthApplication',
                'category' => 'Health & Fitness'
            ],
            
            'bmrcalc' => [
                'title' => 'BMR Calculator - Calculate Basal Metabolic Rate',
                'description' => 'Free BMR calculator to determine your basal metabolic rate. Calculate daily calorie needs for weight loss, maintenance, or gain.',
                'keywords' => 'bmr calculator, basal metabolic rate, calorie calculator, metabolism calculator, daily calories',
                'type' => 'HealthApplication',
                'category' => 'Health & Fitness'
            ],
            
            'caloricalc' => [
                'title' => 'Calorie Calculator - Daily Calorie Needs & Weight Management',
                'description' => 'Free calorie calculator to determine your daily calorie needs for weight loss, maintenance, or muscle gain. Based on age, weight, height, and activity level.',
                'keywords' => 'calorie calculator, daily calories, weight loss calculator, calorie needs, maintenance calories',
                'type' => 'HealthApplication',
                'category' => 'Health & Fitness'
            ],
            
            // Finance Calculators
            'mortgagecalc' => [
                'title' => 'Mortgage Calculator - Calculate Monthly Payments & Amortization',
                'description' => 'Free mortgage calculator to estimate monthly payments, total interest, and amortization schedule. Perfect for home buying and refinancing decisions.',
                'keywords' => 'mortgage calculator, monthly payment, amortization schedule, home loan calculator, mortgage payment',
                'type' => 'FinanceApplication',
                'category' => 'Mortgage & Finance'
            ],
            
            'loancalc' => [
                'title' => 'Loan Calculator - Calculate Loan Payments & Interest',
                'description' => 'Free loan calculator to determine monthly payments, total interest, and payoff schedule for personal loans, auto loans, and student loans.',
                'keywords' => 'loan calculator, personal loan calculator, auto loan calculator, monthly payment, interest calculator',
                'type' => 'FinanceApplication',
                'category' => 'Mortgage & Finance'
            ],
            
            'autoloancalc' => [
                'title' => 'Auto Loan Calculator - Car Loan Payments & Interest',
                'description' => 'Free auto loan calculator to estimate monthly car payments, total interest costs, and compare different loan terms for your vehicle purchase.',
                'keywords' => 'auto loan calculator, car loan calculator, vehicle financing, monthly car payment, auto interest',
                'type' => 'FinanceApplication',
                'category' => 'Mortgage & Finance'
            ],
            
             'calcage' => [
                'title' => 'Age Calculator - Calculate your exact age, milestones, and more',
                'description' => 'Free Age Calculator - Calculate your exact age, milestones, Yearly age table, zodiac sign based on birth date and age in years, months, days, totalDays, totalWeeks, totalMonths, days Until Next Birthday',
                'keywords' => 'Free Age Calculator, Yearly age table, Next Birthday, zodiac sign',
                'type' => 'calculatorApplication',
                'category' => 'Other Calculators'
            ],
            
             'duedatcalc' => [
                'title' => 'Due Date Calculator - Modify the values and click the calculate button to use',
                'description' => 'The Due Date Calculator estimates the delivery date of a pregnant woman based on her last menstrual period (LMP), ultrasound, conception date, or IVF transfer date.',
                'keywords' => 'Estimates the delivery date, last menstrual period, conception date, IVF transfer date.',
                'type' => 'calculatorApplication',
                'category' => 'Health & Fitness'
            ],
            
            // Add more calculators as needed...
        ];
    }
    
    public function generateMetaTags($pageName) {
        $data = $this->pageData[$pageName] ?? $this->getDefaultMeta($pageName);
        
        $baseUrl = 'https://top10calculators.com';
        $pageUrl = $baseUrl . '/calculators/' . $pageName . '.html';
        
        return [
            'title' => $data['title'] . ' | Top10Calculators',
            'description' => $data['description'],
            'keywords' => $data['keywords'],
            'canonical' => $pageUrl,
            'og_title' => $data['title'],
            'og_description' => $data['description'],
            'og_url' => $pageUrl,
            
            
            // 'og_image' => $baseUrl . '/images/icons/og-' . $data['category'] . '.png',
            // 'twitter_image' => $baseUrl . '/images/icons/twitter-' . $data['category'] . '.png',
            
            'og_image' => $baseUrl . '/images/icons/og-' . str_replace([' ', '&'], '', $data['category']) . '.png',
            'twitter_image' => $baseUrl . '/images/icons/twitter-' . str_replace([' ', '&'], '', $data['category']) . '.png',
            
            
            'schema_type' => $data['type'],
            'page_name' => $pageName
        ];
    }
    
    public function generateHTMLMetaTags($pageName) {
        $meta = $this->generateMetaTags($pageName);
        
        $html = <<<HTML
    <!-- Auto-generated SEO Meta Tags -->
    <title>{$meta['title']}</title>
    <meta name="description" content="{$meta['description']}">
    <meta name="keywords" content="{$meta['keywords']}">
    <meta name="robots" content="index, follow, max-snippet:150, max-image-preview:large">
    <link rel="canonical" href="{$meta['canonical']}">
    
    <!-- Open Graph -->
    <meta property="og:type" content="website">
    <meta property="og:url" content="{$meta['og_url']}">
    <meta property="og:title" content="{$meta['og_title']}">
    <meta property="og:description" content="{$meta['og_description']}">
    <meta property="og:image" content="{$meta['og_image']}">
    <meta property="og:site_name" content="Top10Calculators">
    
    <!-- Twitter Card -->
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:url" content="{$meta['og_url']}">
    <meta name="twitter:title" content="{$meta['og_title']}">
    <meta name="twitter:description" content="{$meta['og_description']}">
    <meta name="twitter:image" content="{$meta['twitter_image']}">
    
    <!-- Structured Data -->
    <script type="application/ld+json">
    {
        "@context": "https://schema.org",
        "@type": "Calculator",
        "name": "{$meta['og_title']}",
        "description": "{$meta['description']}",
        "url": "{$meta['canonical']}",
        "operatingSystem": "Web Browser",
        "applicationCategory": "{$meta['schema_type']}",
        "author": {
            "@type": "Organization",
            "name": "Top10Calculators",
            "url": "https://top10calculators.com"
        },
        "offers": {
            "@type": "Offer",
            "price": "0",
            "priceCurrency": "USD"
        }
    }
    </script>

HTML;
        return $html;
    }
    
    private function getDefaultMeta($pageName) {
        $prettyName = str_replace('calc', ' Calculator', ucfirst($pageName));
        $prettyName = str_replace(['-', '_'], ' ', $prettyName);
        
        return [
            'title' => $prettyName,
            'description' => 'Free online ' . strtolower($prettyName) . ' for accurate calculations and instant results. Easy to use with detailed explanations.',
            'keywords' => strtolower($prettyName) . ', online calculator, free calculator, calculation tool',
            'type' => 'Calculator',
            'category' => 'Other'
        ];
    }
    
    public function getAllPageNames() {
        return array_keys($this->pageData);
    }
}

// Helper function to use in your pages
function getMetaTags($pageName) {
    $generator = new MetaTagGenerator();
    return $generator->generateHTMLMetaTags($pageName);
}

// For direct access
if (isset($_GET['page'])) {
    header('Content-Type: text/html; charset=utf-8');
    $generator = new MetaTagGenerator();
    echo $generator->generateHTMLMetaTags($_GET['page']);
}
?>