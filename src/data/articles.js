import mythVsTruthImg from '../assets/images/mythvstruth.webp';
import proteinTipsImg from '../assets/images/protein1.jpg';

export const articles = [
    {
        id: 1,
        title: 'The Science of Protein Timing',
        desc: 'Maximizing protein synthesis requires strategic timing. Discover when your body needs it most.',
        category: 'Nutrition',
        image: proteinTipsImg,
        author: 'Dr. Sarah Wilson',
        date: 'Feb 12, 2024',
        content: `
            <p>Protein timing is one of the most debated topics in sports nutrition. For years, the "anabolic window"—the idea that you must consume protein within 30 minutes of your workout—was considered absolute truth. However, modern research suggests a more nuanced approach.</p>
            
            <h3>What is Protein Timing?</h3>
            <p>Protein timing refers to the strategic consumption of protein at specific times of the day, particularly in relation to exercise, to maximize muscle protein synthesis (MPS) and promote recovery.</p>
            
            <h3>The Muscle Protein Synthesis Window</h3>
            <p>While the immediate post-workout window is beneficial, recent studies show that MPS remains elevated for up to 24-48 hours after resistance training. This means that total daily protein intake is more critical than the exact minute you consume it.</p>
            
            <h3>Practical Recommendations</h3>
            <ul>
                <li><strong>Pre-Workout:</strong> A small protein-rich snack 1-2 hours before training can provide amino acids during the session.</li>
                <li><strong>Post-Workout:</strong> Aim for 20-40g of high-quality protein within 2 hours of finishing your session.</li>
                <li><strong>Consistency:</strong> Distribute your protein intake evenly throughout the day (every 3-4 hours) to maintain an anabolic state.</li>
            </ul>
            
            <p>In conclusion, while timing is a tool, consistency and total daily intake are the foundations of muscle growth and recovery.</p>
        `
    },
    {
        id: 2,
        title: 'Creatine Myths vs Facts',
        desc: 'Separating science from locker room talk about the most researched supplement on earth.',
        category: 'Supplements',
        image: mythVsTruthImg,
        author: 'Marcus Chen, CSCS',
        date: 'Feb 10, 2024',
        content: `
            <p>Creatine monohydrate is perhaps the most researched and effective supplement in the history of sports science. Yet, it remains shrouded in myths and misconceptions. Let's look at the facts.</p>
            
            <h3>Myth 1: Creatine is a Steroid</h3>
            <p><strong>Fact:</strong> Creatine is a naturally occurring compound found in red meat and fish. It is also produced by our own bodies. It has nothing to do with anabolic steroids.</p>
            
            <h3>Myth 2: Creatine Causes Kidney Damage</h3>
            <p><strong>Fact:</strong> For healthy individuals with no pre-existing kidney issues, hundreds of studies have shown that long-term creatine use is perfectly safe. Always consult a doctor if you have concerns.</p>
            
            <h3>Myth 3: You Must "Load" Creatine</h3>
            <p><strong>Fact:</strong> While a loading phase (20g/day for 5-7 days) saturates muscle stores faster, a steady dose of 3-5g per day will achieve the same results after about 3-4 weeks.</p>
            
            <h3>Why Use Creatine?</h3>
            <p>Creatine helps your muscles produce energy during heavy lifting or high-intensity exercise by increasing your stores of phosphocreatine. This leads to improved strength, power, and muscle mass over time.</p>
        `
    },
    {
        id: 3,
        title: 'Building Muscle at Home',
        desc: 'No gym? No problem. Master these compound movements to build a powerful physique anywhere.',
        category: 'Training',
        image: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?q=80&w=800&auto=format&fit=crop',
        author: 'Elena Rodriguez',
        date: 'Feb 08, 2024',
        content: `
            <p>In a world of high-tech gym equipment, we often forget that the most powerful tool for building muscle is our own body weight. Whether you're traveling or prefer home workouts, you can achieve elite results with the right approach.</p>
            
            <h3>The Power of Progressive Overload</h3>
            <p>The key to home workouts isn't just doing more reps. It's making those reps harder. This is called progressive overload. You can achieve this through tempo changes, shorter rest periods, or more challenging exercise variations.</p>
            
            <h3>Targeting the Full Body</h3>
            <p>Focus on these key movement patterns:</p>
            <ul>
                <li><strong>Push:</strong> Push-up variations (Diamond, Archer, Pseudo-planche).</li>
                <li><strong>Pull:</strong> Pull-ups (if you have a bar) or "towel rows" using a sturdy door.</li>
                <li><strong>Legs:</strong> Bulgarian split squats, pistol squats, and glute bridges.</li>
                <li><strong>Core:</strong> Hollow body holds and planks.</li>
            </ul>
            
            <h3>Sample Routine</h3>
            <p>Perform these as a circuit twice, with 60 seconds rest between exercises:</p>
            <ol>
                <li>Max Push-ups (focus on form)</li>
                <li>Bulgarian Split Squats (12 per leg)</li>
                <li>Dips (on a chair or bench)</li>
                <li>Walking Lunges (20 total steps)</li>
            </ol>
            
            <p>Remember, intensity and form are more important than quantity. Slow down the movements to increase "time under tension" for maximum growth.</p>
        `
    }
];
