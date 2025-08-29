let selectedAge = '';
let selectedMode = 'wakeup';

// Age range sleep recommendations (in hours)
const ageRanges = {
    '0-3-months': { min: 14, max: 17, label: '0-3 months old' },
    '4-11-months': { min: 12, max: 16, label: '4-11 months old' },
    '1-2-years': { min: 11, max: 14, label: '1-2 years old' },
    '3-5-years': { min: 10, max: 13, label: '3-5 years old' },
    '6-13-years': { min: 9, max: 11, label: '6-13 years old' },
    '14-17-years': { min: 8, max: 10, label: '14-17 years old' },
    '18-25-years': { min: 7, max: 9, label: '18-25 years old' },
    '26-35-years': { min: 7, max: 9, label: '26-35 years old' },
    '36-45-years': { min: 7, max: 9, label: '36-45 years old' },
    '46-55-years': { min: 7, max: 9, label: '46-55 years old' },
    '56-64-years': { min: 7, max: 9, label: '56-64 years old' },
    '65-years': { min: 7, max: 8, label: '65+ years old' }
};

// Initialize event listeners
document.addEventListener('DOMContentLoaded', function () {
    // Hamburger menu functionality
    const hamburger = document.getElementById('hamburger');
    const navMenu = document.getElementById('navMenu');
    
    if (hamburger && navMenu) {
        hamburger.addEventListener('click', function() {
            navMenu.classList.toggle('active');
        });

        // Close menu when clicking outside
        document.addEventListener('click', function(e) {
            if (!hamburger.contains(e.target) && !navMenu.contains(e.target)) {
                navMenu.classList.remove('active');
            }
        });

        // Close menu when clicking on nav links
        navMenu.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                navMenu.classList.remove('active');
            });
        });
    }

    // Age selection (only if elements exist)
    const ageButtons = document.querySelectorAll('.age-button');
    if (ageButtons.length > 0) {
        ageButtons.forEach(button => {
            button.addEventListener('click', function () {
                ageButtons.forEach(b => b.classList.remove('active'));
                this.classList.add('active');
                selectedAge = this.dataset.age;
            });
        });
    }

    // Schedule mode selection (only if elements exist)
    const scheduleButtons = document.querySelectorAll('.schedule-option');
    if (scheduleButtons.length > 0) {
        scheduleButtons.forEach(button => {
            button.addEventListener('click', function () {
                scheduleButtons.forEach(b => b.classList.remove('active'));
                this.classList.add('active');
                selectedMode = this.dataset.mode;
            });
        });
    }

    // Initialize mattress finder
    initializeMattressFinder();
});

function calculateSleep() {
    // Validate inputs
    if (!selectedAge) {
        alert('Please select your age range');
        return;
    }

    const hour = document.getElementById('hour')?.value;
    const minute = document.getElementById('minute')?.value;
    const ampm = document.getElementById('ampm')?.value;

    if (!hour || minute === '' || !ampm) {
        alert('Please select a complete time');
        return;
    }

    // Convert time to 24-hour format
    let inputTime = convertTo24Hour(parseInt(hour), parseInt(minute), ampm);

    // Get age range data
    const ageData = ageRanges[selectedAge];

    // Calculate sleep recommendations
    const recommendations = calculateSleepTimes(inputTime, ageData, selectedMode);

    // Display results
    displayResults(recommendations, inputTime, ageData);
}

function convertTo24Hour(hour, minute, ampm) {
    let hour24 = hour;
    if (ampm === 'PM' && hour !== 12) {
        hour24 += 12;
    } else if (ampm === 'AM' && hour === 12) {
        hour24 = 0;
    }
    return hour24 * 60 + minute; // Return total minutes from midnight
}

function convertToDisplayTime(totalMinutes) {
    let hours = Math.floor(totalMinutes / 60) % 24;
    let minutes = totalMinutes % 60;

    if (hours < 0) hours += 24;
    if (totalMinutes < 0) totalMinutes += 1440; // Handle day overflow

    const ampm = hours >= 12 ? 'PM' : 'AM';
    const displayHour = hours === 0 ? 12 : (hours > 12 ? hours - 12 : hours);

    return {
        time: `${displayHour.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')} ${ampm}`,
        totalMinutes: totalMinutes
    };
}

function calculateSleepTimes(inputTime, ageData, mode) {
    const recommendations = [];
    const sleepCycleMinutes = 90; // 90 minutes per cycle
    const fallAsleepTime = 15; // 15 minutes to fall asleep

    // Calculate possible sleep durations based on age
    const minSleepHours = ageData.min;
    const maxSleepHours = ageData.max;

    // Generate 2-4 recommendations within the age range
    const sleepDurations = [];
    for (let hours = minSleepHours; hours <= maxSleepHours; hours += 1.5) {
        if (sleepDurations.length < 4) {
            sleepDurations.push(hours);
        }
    }

    // If we don't have enough options, add some variations
    if (sleepDurations.length < 2) {
        sleepDurations.push(minSleepHours + 0.5, maxSleepHours - 0.5);
    }

    sleepDurations.slice(0, 4).forEach(duration => {
        const totalSleepMinutes = duration * 60;
        const cycles = Math.round(totalSleepMinutes / sleepCycleMinutes);
        const adjustedSleepMinutes = cycles * sleepCycleMinutes;

        let bedtime, wakeTime;

        if (mode === 'wakeup') {
            wakeTime = inputTime;
            bedtime = inputTime - adjustedSleepMinutes - fallAsleepTime;
        } else {
            bedtime = inputTime;
            wakeTime = inputTime + adjustedSleepMinutes + fallAsleepTime;
        }

        recommendations.push({
            bedtime: convertToDisplayTime(bedtime),
            wakeTime: convertToDisplayTime(wakeTime),
            totalHours: Math.floor(adjustedSleepMinutes / 60),
            totalMinutes: adjustedSleepMinutes % 60,
            cycles: cycles
        });
    });

    return recommendations.slice(0, 4); // Limit to 4 recommendations
}

function displayResults(recommendations, inputTime, ageData) {
    const resultsText = document.getElementById('resultsText');
    const resultsGrid = document.getElementById('resultsGrid');
    const calculator = document.getElementById('calculator');
    const results = document.getElementById('results');
    
    if (!resultsText || !resultsGrid || !calculator || !results) return;
    
    const inputDisplay = convertToDisplayTime(inputTime);

    const actionText = selectedMode === 'wakeup' ? 'wake up refreshed' : 'go to bed';
    const resultActionText = selectedMode === 'wakeup' ? 'go to bed' : 'wake up';

    resultsText.innerHTML = `
        It typically takes 15 minutes to fall asleep. If you're ${ageData.label} and want to ${actionText} at ${inputDisplay.time}, you should ${resultActionText} at one of the following times:
    `;

    resultsGrid.innerHTML = '';

    recommendations.forEach(rec => {
        const card = document.createElement('div');
        card.className = 'result-card';

        const primaryTime = selectedMode === 'wakeup' ? rec.bedtime : rec.wakeTime;
        const secondaryTime = selectedMode === 'wakeup' ? rec.wakeTime : rec.bedtime;
        const primaryLabel = selectedMode === 'wakeup' ? 'Recommended bedtime' : 'Recommended wake time';
        const secondaryLabel = selectedMode === 'wakeup' ? 'Wake time' : 'Bedtime';

        card.innerHTML = `
            <div class="label">🌙 ${primaryLabel}</div>
            <div class="time">${primaryTime.time}</div>
            <div class="wake-label">☀️ ${secondaryLabel}</div>
            <div class="wake-time">${secondaryTime.time}</div>
            <div class="sleep-info">
                ${rec.totalHours}h ${rec.totalMinutes > 0 ? rec.totalMinutes + 'm' : ''} Hours in Bed<br>
                (${rec.cycles} Sleep Cycles)
            </div>
        `;

        resultsGrid.appendChild(card);
    });

    // Show results, hide calculator
    calculator.classList.add('hidden');
    results.classList.add('active');
}

function goBack() {
    const calculator = document.getElementById('calculator');
    const results = document.getElementById('results');
    
    if (calculator && results) {
        results.classList.remove('active');
        calculator.classList.remove('hidden');
    }
}

// Mattress Finder JavaScript Functionality
function initializeMattressFinder() {
    const mattressSection = document.getElementById('mattress-finder');
    if (!mattressSection) return; // Exit if mattress finder doesn't exist on this page

    // Mattress recommendation database
    const mattressDatabase = {
        // Back sleepers
        back: {
            none: {
                soft: { type: "Memory Foam", firmness: "Medium-Soft", features: ["Conforms to body curves", "Pressure relief", "Motion isolation"] },
                medium: { type: "Hybrid", firmness: "Medium", features: ["Balanced support", "Temperature regulation", "Responsive feel"] },
                firm: { type: "Innerspring", firmness: "Firm", features: ["Strong back support", "Good airflow", "Durable construction"] },
                "extra-firm": { type: "Latex", firmness: "Extra Firm", features: ["Natural materials", "Excellent support", "Long-lasting"] },
                "no-preference": { type: "Hybrid", firmness: "Medium", features: ["Best of both worlds", "Versatile comfort", "Great for couples"] }
            },
            back: {
                soft: { type: "Memory Foam", firmness: "Medium", features: ["Spinal alignment", "Pressure point relief", "Contouring support"] },
                medium: { type: "Latex", firmness: "Medium-Firm", features: ["Natural support", "Responsive", "Pain relief"] },
                firm: { type: "Hybrid", firmness: "Firm", features: ["Targeted back support", "Edge support", "Cooling technology"] },
                "extra-firm": { type: "Innerspring", firmness: "Extra Firm", features: ["Maximum support", "Spinal alignment", "Orthopedic benefits"] },
                "no-preference": { type: "Memory Foam", firmness: "Medium-Firm", features: ["Adaptive support", "Pain relief", "Pressure distribution"] }
            },
            neck: {
                soft: { type: "Memory Foam", firmness: "Medium", features: ["Neck contour support", "Pressure relief", "Adaptive firmness"] },
                medium: { type: "Latex", firmness: "Medium", features: ["Natural alignment", "Responsive support", "Breathable"] },
                firm: { type: "Hybrid", firmness: "Medium-Firm", features: ["Zoned support", "Neck alignment", "Temperature control"] },
                "extra-firm": { type: "Latex", firmness: "Firm", features: ["Consistent support", "Natural materials", "Durability"] },
                "no-preference": { type: "Hybrid", firmness: "Medium", features: ["Balanced comfort", "Multi-zone support", "Versatile"] }
            },
            shoulders: {
                soft: { type: "Memory Foam", firmness: "Medium-Soft", features: ["Shoulder pressure relief", "Body contouring", "Motion isolation"] },
                medium: { type: "Hybrid", firmness: "Medium", features: ["Pressure point relief", "Supportive base", "Comfort layers"] },
                firm: { type: "Latex", firmness: "Medium-Firm", features: ["Natural pressure relief", "Responsive", "Shoulder comfort"] },
                "extra-firm": { type: "Hybrid", firmness: "Firm", features: ["Structured support", "Pressure distribution", "Edge support"] },
                "no-preference": { type: "Memory Foam", firmness: "Medium", features: ["Adaptive comfort", "Pressure relief", "Body alignment"] }
            },
            hips: {
                soft: { type: "Memory Foam", firmness: "Medium", features: ["Hip pressure relief", "Contouring", "Spinal alignment"] },
                medium: { type: "Hybrid", firmness: "Medium", features: ["Hip support", "Pressure distribution", "Comfort zones"] },
                firm: { type: "Latex", firmness: "Medium-Firm", features: ["Hip alignment", "Natural support", "Responsive feel"] },
                "extra-firm": { type: "Innerspring", firmness: "Firm", features: ["Strong hip support", "Spinal alignment", "Durable"] },
                "no-preference": { type: "Hybrid", firmness: "Medium", features: ["Balanced support", "Hip comfort", "Versatile design"] }
            },
            joints: {
                soft: { type: "Memory Foam", firmness: "Medium-Soft", features: ["Joint pressure relief", "Gentle support", "Pain reduction"] },
                medium: { type: "Latex", firmness: "Medium", features: ["Natural support", "Joint comfort", "Responsive"] },
                firm: { type: "Hybrid", firmness: "Medium-Firm", features: ["Joint support", "Pressure relief", "Stability"] },
                "extra-firm": { type: "Latex", firmness: "Firm", features: ["Consistent support", "Joint alignment", "Natural materials"] },
                "no-preference": { type: "Memory Foam", firmness: "Medium", features: ["Adaptive support", "Joint relief", "Comfort"] }
            }
        },
        // Side sleepers
        side: {
            none: {
                soft: { type: "Memory Foam", firmness: "Soft", features: ["Side sleeper comfort", "Pressure relief", "Hip & shoulder support"] },
                medium: { type: "Hybrid", firmness: "Medium-Soft", features: ["Side sleeping support", "Pressure point relief", "Motion isolation"] },
                firm: { type: "Latex", firmness: "Medium", features: ["Natural contouring", "Responsive support", "Breathable comfort"] },
                "extra-firm": { type: "Hybrid", firmness: "Medium-Firm", features: ["Structured side support", "Edge support", "Temperature control"] },
                "no-preference": { type: "Memory Foam", firmness: "Medium-Soft", features: ["Optimal side sleeping", "Pressure relief", "Comfort"] }
            },
            back: {
                soft: { type: "Memory Foam", firmness: "Medium-Soft", features: ["Spinal alignment for side sleepers", "Back pain relief", "Pressure distribution"] },
                medium: { type: "Latex", firmness: "Medium", features: ["Side sleeping back support", "Natural materials", "Pain relief"] },
                firm: { type: "Hybrid", firmness: "Medium-Firm", features: ["Firm side support", "Back alignment", "Targeted relief"] },
                "extra-firm": { type: "Latex", firmness: "Firm", features: ["Maximum side support", "Back pain relief", "Durable"] },
                "no-preference": { type: "Hybrid", firmness: "Medium", features: ["Balanced side sleeping", "Back support", "Versatile"] }
            },
            neck: {
                soft: { type: "Memory Foam", firmness: "Medium", features: ["Side sleeper neck support", "Pressure relief", "Contouring"] },
                medium: { type: "Latex", firmness: "Medium", features: ["Natural neck alignment", "Side sleeping comfort", "Responsive"] },
                firm: { type: "Hybrid", firmness: "Medium-Firm", features: ["Structured neck support", "Side alignment", "Temperature control"] },
                "extra-firm": { type: "Latex", firmness: "Firm", features: ["Firm neck support", "Side sleeping alignment", "Natural materials"] },
                "no-preference": { type: "Memory Foam", firmness: "Medium", features: ["Side neck comfort", "Adaptive support", "Pressure relief"] }
            },
            shoulders: {
                soft: { type: "Memory Foam", firmness: "Soft", features: ["Shoulder pressure relief", "Side sleeping comfort", "Deep contouring"] },
                medium: { type: "Hybrid", firmness: "Medium-Soft", features: ["Side sleeper shoulder support", "Pressure point relief", "Comfort layers"] },
                firm: { type: "Latex", firmness: "Medium", features: ["Natural shoulder relief", "Side sleeping support", "Responsive feel"] },
                "extra-firm": { type: "Hybrid", firmness: "Medium-Firm", features: ["Structured shoulder support", "Side alignment", "Edge support"] },
                "no-preference": { type: "Memory Foam", firmness: "Medium-Soft", features: ["Optimal shoulder comfort", "Side sleeping", "Pressure relief"] }
            },
            hips: {
                soft: { type: "Memory Foam", firmness: "Soft", features: ["Hip pressure relief", "Side sleeping alignment", "Deep contouring"] },
                medium: { type: "Hybrid", firmness: "Medium-Soft", features: ["Side sleeper hip support", "Pressure distribution", "Comfort zones"] },
                firm: { type: "Latex", firmness: "Medium", features: ["Natural hip relief", "Side sleeping support", "Responsive comfort"] },
                "extra-firm": { type: "Hybrid", firmness: "Medium-Firm", features: ["Structured hip support", "Side alignment", "Targeted relief"] },
                "no-preference": { type: "Memory Foam", firmness: "Medium-Soft", features: ["Optimal hip comfort", "Side sleeping", "Pressure relief"] }
            },
            joints: {
                soft: { type: "Memory Foam", firmness: "Soft", features: ["Joint pressure relief", "Side sleeping comfort", "Pain reduction"] },
                medium: { type: "Latex", firmness: "Medium-Soft", features: ["Natural joint support", "Side sleeping relief", "Responsive comfort"] },
                firm: { type: "Hybrid", firmness: "Medium", features: ["Joint support for side sleepers", "Pressure relief", "Stability"] },
                "extra-firm": { type: "Latex", firmness: "Medium-Firm", features: ["Firm joint support", "Side sleeping alignment", "Natural materials"] },
                "no-preference": { type: "Memory Foam", firmness: "Medium-Soft", features: ["Side sleeping joint relief", "Adaptive support", "Comfort"] }
            }
        },
        // Stomach sleepers
        stomach: {
            none: {
                soft: { type: "Latex", firmness: "Medium-Firm", features: ["Stomach sleeping support", "Prevents sinking", "Natural materials"] },
                medium: { type: "Hybrid", firmness: "Firm", features: ["Stomach sleeper support", "Spinal alignment", "Edge support"] },
                firm: { type: "Innerspring", firmness: "Firm", features: ["Strong stomach support", "Prevents sinking", "Good airflow"] },
                "extra-firm": { type: "Latex", firmness: "Extra Firm", features: ["Maximum stomach support", "Natural materials", "Durable"] },
                "no-preference": { type: "Hybrid", firmness: "Firm", features: ["Optimal stomach sleeping", "Balanced support", "Temperature control"] }
            },
            back: {
                soft: { type: "Latex", firmness: "Medium-Firm", features: ["Stomach sleeping back support", "Spinal alignment", "Natural materials"] },
                medium: { type: "Hybrid", firmness: "Firm", features: ["Back support for stomach sleepers", "Structured support", "Pain relief"] },
                firm: { type: "Innerspring", firmness: "Extra Firm", features: ["Maximum back support", "Stomach sleeping alignment", "Durable"] },
                "extra-firm": { type: "Latex", firmness: "Extra Firm", features: ["Firm back support", "Stomach sleeping comfort", "Natural materials"] },
                "no-preference": { type: "Hybrid", firmness: "Firm", features: ["Stomach sleeping back relief", "Balanced support", "Versatile"] }
            },
            neck: {
                soft: { type: "Latex", firmness: "Medium-Firm", features: ["Stomach sleeping neck support", "Prevents over-extension", "Natural alignment"] },
                medium: { type: "Hybrid", firmness: "Firm", features: ["Neck support for stomach sleepers", "Spinal alignment", "Temperature control"] },
                firm: { type: "Innerspring", firmness: "Firm", features: ["Strong neck support", "Stomach sleeping alignment", "Good airflow"] },
                "extra-firm": { type: "Latex", firmness: "Extra Firm", features: ["Firm neck support", "Stomach sleeping comfort", "Durable"] },
                "no-preference": { type: "Hybrid", firmness: "Firm", features: ["Stomach sleeping neck relief", "Balanced support", "Comfort"] }
            },
            shoulders: {
                soft: { type: "Latex", firmness: "Medium-Firm", features: ["Stomach sleeping shoulder support", "Natural comfort", "Prevents pressure"] },
                medium: { type: "Hybrid", firmness: "Firm", features: ["Shoulder support for stomach sleepers", "Structured comfort", "Edge support"] },
                firm: { type: "Innerspring", firmness: "Firm", features: ["Strong shoulder support", "Stomach sleeping comfort", "Airflow"] },
                "extra-firm": { type: "Latex", firmness: "Extra Firm", features: ["Firm shoulder support", "Stomach sleeping alignment", "Natural materials"] },
                "no-preference": { type: "Hybrid", firmness: "Firm", features: ["Stomach sleeping shoulder comfort", "Balanced support", "Temperature control"] }
            },
            hips: {
                soft: { type: "Latex", firmness: "Medium-Firm", features: ["Stomach sleeping hip support", "Prevents sinking", "Natural alignment"] },
                medium: { type: "Hybrid", firmness: "Firm", features: ["Hip support for stomach sleepers", "Spinal alignment", "Comfort zones"] },
                firm: { type: "Innerspring", firmness: "Firm", features: ["Strong hip support", "Stomach sleeping alignment", "Durable construction"] },
                "extra-firm": { type: "Latex", firmness: "Extra Firm", features: ["Firm hip support", "Stomach sleeping comfort", "Long-lasting"] },
                "no-preference": { type: "Hybrid", firmness: "Firm", features: ["Stomach sleeping hip relief", "Balanced support", "Versatile design"] }
            },
            joints: {
                soft: { type: "Latex", firmness: "Medium-Firm", features: ["Joint support for stomach sleepers", "Natural materials", "Comfortable firmness"] },
                medium: { type: "Hybrid", firmness: "Firm", features: ["Stomach sleeping joint relief", "Structured support", "Pain reduction"] },
                firm: { type: "Innerspring", firmness: "Firm", features: ["Strong joint support", "Stomach sleeping comfort", "Supportive construction"] },
                "extra-firm": { type: "Latex", firmness: "Extra Firm", features: ["Maximum joint support", "Stomach sleeping alignment", "Natural comfort"] },
                "no-preference": { type: "Hybrid", firmness: "Firm", features: ["Stomach sleeping joint comfort", "Balanced support", "Adaptive relief"] }
            }
        },
        // Combination sleepers
        combination: {
            none: {
                soft: { type: "Memory Foam", firmness: "Medium", features: ["Multi-position comfort", "Adaptive support", "Motion isolation"] },
                medium: { type: "Hybrid", firmness: "Medium", features: ["Combination sleeper support", "Versatile comfort", "Temperature regulation"] },
                firm: { type: "Latex", firmness: "Medium-Firm", features: ["Multi-position support", "Responsive feel", "Natural materials"] },
                "extra-firm": { type: "Hybrid", firmness: "Firm", features: ["Strong multi-position support", "Edge support", "Versatile comfort"] },
                "no-preference": { type: "Hybrid", firmness: "Medium", features: ["Perfect for combination sleepers", "Balanced support", "All-position comfort"] }
            },
            back: {
                soft: { type: "Memory Foam", firmness: "Medium", features: ["Multi-position back support", "Adaptive comfort", "Pain relief"] },
                medium: { type: "Latex", firmness: "Medium-Firm", features: ["Combination sleeper back support", "Natural materials", "Responsive comfort"] },
                firm: { type: "Hybrid", firmness: "Firm", features: ["Strong back support", "Multi-position comfort", "Edge support"] },
                "extra-firm": { type: "Latex", firmness: "Firm", features: ["Maximum back support", "Combination sleeping", "Durable materials"] },
                "no-preference": { type: "Hybrid", firmness: "Medium-Firm", features: ["Combination sleeper back relief", "Balanced support", "Versatile comfort"] }
            },
            neck: {
                soft: { type: "Memory Foam", firmness: "Medium", features: ["Multi-position neck support", "Adaptive contouring", "Pressure relief"] },
                medium: { type: "Latex", firmness: "Medium", features: ["Combination sleeper neck support", "Natural alignment", "Responsive feel"] },
                firm: { type: "Hybrid", firmness: "Medium-Firm", features: ["Neck support all positions", "Structured comfort", "Temperature control"] },
                "extra-firm": { type: "Latex", firmness: "Firm", features: ["Firm neck support", "Multi-position comfort", "Natural materials"] },
                "no-preference": { type: "Hybrid", firmness: "Medium", features: ["Combination sleeper neck comfort", "Balanced support", "All-position relief"] }
            },
            shoulders: {
                soft: { type: "Memory Foam", firmness: "Medium-Soft", features: ["Multi-position shoulder relief", "Adaptive comfort", "Pressure distribution"] },
                medium: { type: "Hybrid", firmness: "Medium", features: ["Combination sleeper shoulder support", "Versatile comfort", "Motion isolation"] },
                firm: { type: "Latex", firmness: "Medium-Firm", features: ["Shoulder support all positions", "Natural comfort", "Responsive feel"] },
                "extra-firm": { type: "Hybrid", firmness: "Firm", features: ["Strong shoulder support", "Multi-position comfort", "Edge support"] },
                "no-preference": { type: "Memory Foam", firmness: "Medium", features: ["Combination sleeper shoulder comfort", "Adaptive support", "All-position relief"] }
            },
            hips: {
                soft: { type: "Memory Foam", firmness: "Medium", features: ["Multi-position hip relief", "Adaptive contouring", "Pressure distribution"] },
                medium: { type: "Hybrid", firmness: "Medium", features: ["Combination sleeper hip support", "Versatile comfort", "Comfort zones"] },
                firm: { type: "Latex", firmness: "Medium-Firm", features: ["Hip support all positions", "Natural materials", "Responsive comfort"] },
                "extra-firm": { type: "Hybrid", firmness: "Firm", features: ["Strong hip support", "Multi-position comfort", "Targeted relief"] },
                "no-preference": { type: "Hybrid", firmness: "Medium", features: ["Combination sleeper hip comfort", "Balanced support", "All-position relief"] }
            },
            joints: {
                soft: { type: "Memory Foam", firmness: "Medium-Soft", features: ["Multi-position joint relief", "Gentle support", "Pain reduction"] },
                medium: { type: "Latex", firmness: "Medium", features: ["Combination sleeper joint support", "Natural comfort", "Adaptive relief"] },
                firm: { type: "Hybrid", firmness: "Medium-Firm", features: ["Joint support all positions", "Structured comfort", "Pain relief"] },
                "extra-firm": { type: "Latex", firmness: "Firm", features: ["Strong joint support", "Multi-position comfort", "Natural materials"] },
                "no-preference": { type: "Hybrid", firmness: "Medium", features: ["Combination sleeper joint comfort", "Balanced support", "All-position relief"] }
            }
        }
    };

    // Store user selections
    let userSelections = {
        sleepPosition: '',
        painAreas: '',
        mattressPreference: ''
    };

    // Initialize dropdown functionality
    const dropdowns = document.querySelectorAll('.custom-dropdown');
    
    dropdowns.forEach(dropdown => {
        const selected = dropdown.querySelector('.dropdown-selected');
        const options = dropdown.querySelector('.dropdown-options');
        const dropdownOptions = dropdown.querySelectorAll('.dropdown-option');
        
        if (!selected || !options) return;

        // Toggle dropdown
        selected.addEventListener('click', (e) => {
            e.preventDefault();
            
            // Close other dropdowns
            dropdowns.forEach(otherDropdown => {
                if (otherDropdown !== dropdown) {
                    otherDropdown.querySelector('.dropdown-selected')?.classList.remove('active');
                    otherDropdown.querySelector('.dropdown-options')?.classList.remove('active');
                }
            });
            
            selected.classList.toggle('active');
            options.classList.toggle('active');
        });

        // Handle option selection
        dropdownOptions.forEach(option => {
            option.addEventListener('click', (e) => {
                e.preventDefault();
                const value = option.dataset.value;
                const text = option.textContent;
                const dropdownType = dropdown.dataset.dropdown;
                
                // Update selected text
                const selectedText = selected.querySelector('.selected-text');
                if (selectedText) {
                    selectedText.textContent = text;
                }
                
                // Store selection
                userSelections[dropdownType.replace('-', '')] = value;
                
                // Close dropdown
                selected.classList.remove('active');
                options.classList.remove('active');
            });
        });
    });

    // Close dropdowns when clicking outside
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.custom-dropdown')) {
            dropdowns.forEach(dropdown => {
                dropdown.querySelector('.dropdown-selected')?.classList.remove('active');
                dropdown.querySelector('.dropdown-options')?.classList.remove('active');
            });
        }
    });

    // Handle find mattress button
    const findMattressBtn = document.getElementById('find-mattress-btn');
    if (findMattressBtn) {
        findMattressBtn.addEventListener('click', () => {
            // Validate selections
            if (!userSelections.sleepposition || !userSelections.painareas || !userSelections.mattresspreference) {
                alert('Please make all selections before finding your mattress.');
                return;
            }

            // Get recommendation
            const recommendation = getMattressRecommendation(userSelections);
            displayMattressResults(recommendation);
        });
    }

    // Handle reset button
    const resetBtn = document.getElementById('reset-finder-btn');
    if (resetBtn) {
        resetBtn.addEventListener('click', () => {
            resetMattressFinder();
        });
    }

    function getMattressRecommendation(selections) {
        const { sleepposition, painareas, mattresspreference } = selections;
        
        try {
            return mattressDatabase[sleepposition][painareas][mattresspreference];
        } catch (error) {
            console.error('Error getting mattress recommendation:', error);
            // Return a default recommendation
            return {
                type: "Hybrid",
                firmness: "Medium",
                features: ["Balanced comfort", "Versatile support", "Great for most sleepers"]
            };
        }
    }

    function displayMattressResults(recommendation) {
        const form = document.querySelector('.mattress-finder-form');
        const results = document.getElementById('mattress-results');
        const resultsContent = document.getElementById('results-content');
        
        if (!form || !results || !resultsContent) return;

        // Hide form, show results
        form.style.display = 'none';
        results.style.display = 'block';

        // Populate results
        resultsContent.innerHTML = `
            <div class="mattress-recommendation">
                <h4>${recommendation.type} Mattress</h4>
                <p><strong>Firmness:</strong> ${recommendation.firmness}</p>
                <p><strong>Key Features:</strong></p>
                <ul class="mattress-features">
                    ${recommendation.features.map(feature => `<li>${feature}</li>`).join('')}
                </ul>
            </div>
        `;
    }

    function resetMattressFinder() {
        const form = document.querySelector('.mattress-finder-form');
        const results = document.getElementById('mattress-results');
        
        if (!form || !results) return;

        // Reset selections
        userSelections = {
            sleepPosition: '',
            painAreas: '',
            mattressPreference: ''
        };

        // Reset dropdown texts
        dropdowns.forEach(dropdown => {
            const selectedText = dropdown.querySelector('.selected-text');
            if (selectedText) {
                selectedText.textContent = 'Select';
            }
            dropdown.querySelector('.dropdown-selected')?.classList.remove('active');
            dropdown.querySelector('.dropdown-options')?.classList.remove('active');
        });

        // Show form, hide results
        form.style.display = 'flex';
        results.style.display = 'none';
    }
}

// faqs javascript functionality
document.addEventListener("DOMContentLoaded", () => {
  const faqItems = document.querySelectorAll(".faq-item");

  faqItems.forEach((item) => {
    const question = item.querySelector("h3");
    const answer = item.querySelector("p");

    // sab answers pehle band
    answer.style.display = "none";

    question.addEventListener("click", () => {
      // sab close karo
      faqItems.forEach((el) => {
        el.querySelector("p").style.display = "none";
      });

      // sirf clicked wala open karo
      answer.style.display = "block";
    });
  });
});


// Read More / Read Less functionality
  document.querySelectorAll('.read-more').forEach(btn => {
    btn.addEventListener('click', function(e) {
      e.preventDefault();
      let fullText = this.previousElementSibling; 
      if (fullText.style.display === "none") {
        fullText.style.display = "block";
        this.textContent = "Read Less";
      } else {
        fullText.style.display = "none";
        this.textContent = "Read More";
      }
    });
  });

  const readMoreButtons = document.querySelectorAll('.read-more');

readMoreButtons.forEach(button => {
    button.addEventListener('click', function(e) {
        e.preventDefault();
        const fullContent = this.previousElementSibling;
        if(fullContent.style.display === "block") {
            fullContent.style.display = "none";
            this.textContent = "Read More";
        } else {
            fullContent.style.display = "block";
            this.textContent = "Read Less";
        }
    });
});


// CSS-in-JS styling

// Apply styles
function applyStyles() {
  const styleEl = document.createElement('style');
  styleEl.textContent = styles;
  document.head.appendChild(styleEl);
}
applyStyles();

// DOM Loaded
document.addEventListener('DOMContentLoaded', function() {
  loadCategories();
  loadPosts();
});

// Categories
function loadCategories() {
  const categories = ['Sleep Tips', 'Health', 'Technology'];
  const container = document.getElementById('categories');
  container.innerHTML = '';
  categories.forEach(cat => {
    const btn = document.createElement('button');
    btn.className = 'category-tag';
    btn.textContent = cat;
    btn.onclick = () => filterByCategory(cat);
    container.appendChild(btn);
  });
}

// Posts
const postsData = [
  { title: '5 Tips for Better Sleep', excerpt: 'Learn how to improve your sleep quality...', category: 'Sleep Tips', image: 'post1.jpg' },
  { title: 'How Technology Affects Sleep', excerpt: 'Devices can impact your rest...', category: 'Technology', image: 'post2.jpg' },
  { title: 'Healthy Sleep Habits', excerpt: 'Build a routine for better sleep...', category: 'Health', image: 'post3.jpg' }
];

function loadPosts(category = null) {
  const container = document.getElementById('posts');
  container.innerHTML = '';
  postsData
    .filter(post => !category || post.category === category)
    .forEach(post => {
      const card = document.createElement('div');
      card.className = 'card';
      card.innerHTML = `
        <img src="${post.image}" alt="${post.title}" style="width:100%; border-radius: var(--border-radius); margin-bottom: 1rem;">
        <h3>${post.title}</h3>
        <p>${post.excerpt}</p>
        <button class="btn btn-outline">Read More</button>
      `;
      container.appendChild(card);
    });
}

// Filter by category
function filterByCategory(cat) {
  loadPosts(cat);
  document.querySelectorAll('.category-tag').forEach(btn => btn.classList.remove('active'));
  event.target.classList.add('active');
}




