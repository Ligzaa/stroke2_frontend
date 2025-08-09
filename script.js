// script.js
document.addEventListener('DOMContentLoaded', function() {
    // DOM elements
    const bookContainer = document.querySelector('.book-container');
    const startBtn = document.querySelector('.start-btn');
    const shareBtn = document.getElementById('share-btn');
    const pages = document.querySelectorAll('.page');
    const infoNextBtn = document.getElementById('info-next-btn');
    const infoForm = document.querySelector('.info-form');
    const riskPercentage = document.getElementById('risk-percentage');
    const timeEstimate = document.getElementById('time-estimate');
    const recommendationText = document.getElementById('recommendation-text');
    // ชี้ไปที่ Backend (Render)
    const API_BASE = 'https://stroke2-backend.onrender.com';

    
    // Form elements
    const ageInput = document.getElementById('age');
    const weightInput = document.getElementById('weight');
    const heightInput = document.getElementById('height');
    const genderSelect = document.getElementById('gender');
    
    // Summary elements
    const userInfoDisplay = document.getElementById('user-info-display');
    const answersDisplay = document.getElementById('answers-display');
    
    // Current page state
    let currentPage = 0;
    const totalPages = pages.length;
    
    // User data storage
    const userData = {
        age: '',
        weight: '',
        height: '',
        gender: '',
        answers: {},
        totalPoints: 0
    };
    
    // Risk level thresholds
    const riskLevels = [
        { max: 7, percentage: 1, time: '60+ ปี', level: 'ต่ำมาก' },
        { max: 13, percentage: "1-3", time: '50+ ปี', level: 'ต่ำ' },
        { max: 17, percentage: "3-6", time: '40+ ปี', level: 'ปานกลาง' },
        { max: 21, percentage: "6-10", time: '30+ ปี', level: 'สูง' },
        { max: 100, percentage: 10, time: ' <10 ปี', level: 'สูงมาก' }
    ];

    
    // Initialize the book
    function initBook() {
        // Show first page
        
        //goToPage(10);
        
        
        // Event listeners
        startBtn.addEventListener('click', () => goToPage(1));
        
        // Form validation
        infoForm.addEventListener('input', function() {
            const isFormValid = ageInput.value && weightInput.value && heightInput.value && genderSelect.value;
            infoNextBtn.disabled = !isFormValid;
        });
        
        // Info next button
        infoNextBtn.addEventListener('click', function() {
            // Save user info
            userData.age = ageInput.value;
            userData.weight = weightInput.value;
            userData.height = heightInput.value;
            userData.gender = genderSelect.value;
            
            goToPage(2);
        });
        
        // Share button functionality
        shareBtn.addEventListener('click', captureResult);
        
        // Option button event delegation
        bookContainer.addEventListener('click', function(e) {
            if (e.target.classList.contains('option-btn')) {
                const pageId = e.target.closest('.page').id;
                const pageIndex = parseInt(pageId.split('-')[1]);
                const question = e.target.closest('.question-section').querySelector('h3').textContent;
                const optionText = e.target.textContent;
                const points = parseInt(e.target.dataset.points);
                
                // Save user answer
                userData.answers[pageIndex] = {
                    question: question,
                    answer: optionText,
                    points: points
                };
                
                // Update UI
                const options = e.target.parentElement.querySelectorAll('.option-btn');
                options.forEach(btn => btn.classList.remove('selected'));
                e.target.classList.add('selected');
                
                // Auto-advance for all pages except the last one
                if (pageIndex < totalPages - 2) {
                    setTimeout(() => goToPage(pageIndex + 1), 500);
                }
            }
        });
        
        // Next button event delegation
        bookContainer.addEventListener('click', function(e) {
            if (e.target.classList.contains('next-btn') && !e.target.disabled) {
                const pageId = e.target.closest('.page').id;
                const pageIndex = parseInt(pageId.split('-')[1]);
                goToPage(pageIndex + 1);
            }
        });
        
        // Previous button event delegation
        bookContainer.addEventListener('click', function(e) {
            if (e.target.classList.contains('prev-btn') && !e.target.disabled) {
                const pageId = e.target.closest('.page').id;
                const pageIndex = parseInt(pageId.split('-')[1]);
                goToPage(pageIndex - 1);
            }
        });
    // Option button event delegation
        bookContainer.addEventListener('click', function(e) {
            if (e.target.classList.contains('option-btn')) {
                const pageDiv = e.target.closest('.page');
                const pageId = pageDiv.id;
                const pageIndex = parseInt(pageId.split('-')[1]);
                const question = e.target.closest('.question-section').querySelector('h3').textContent;
                const optionText = e.target.textContent;
                const points = parseInt(e.target.dataset.points);

                // Save user answer
                userData.answers[pageIndex] = {
                    question: question,
                    answer: optionText,
                    points: points
                };

                // Update UI
                const options = e.target.parentElement.querySelectorAll('.option-btn');
                options.forEach(btn => btn.classList.remove('selected'));
                e.target.classList.add('selected');

                // **Enable next-btn เฉพาะหน้าปัจจุบัน**
                const nextBtn = pageDiv.querySelector('.next-btn');
                if (nextBtn) nextBtn.disabled = false;

                // Auto-advance for all pages except the last one
                if (pageIndex < totalPages - 2) {
                    setTimeout(() => goToPage(pageIndex + 1), 500);
                }
            }
        });
        
        bookContainer.addEventListener('click', function(e) {
        if (e.target.classList.contains('next-btn')) {
            if (e.target.disabled) {
                // Scroll ลงมาเห็น options/danger zone เต็มๆ
                const pageDiv = e.target.closest('.page');
                const pageContent = pageDiv.querySelector('.page-content');
                if (pageContent) {
                    pageContent.scrollTo({ top: pageContent.scrollHeight, behavior: "smooth" });
                }
                // อาจสั่นปุ่ม, ใส่เอฟเฟกต์เตือนด้วยก็ได้
                e.target.classList.add('shake');
                setTimeout(() => e.target.classList.remove('shake'), 500);
                return;
            }
            // ถ้าไม่ disabled ให้ไปหน้าต่อไปตามปกติ
            const pageId = e.target.closest('.page').id;
            const pageIndex = parseInt(pageId.split('-')[1]);
            goToPage(pageIndex + 1);
        }
    });

        
    }
    
    // Navigate to specific page
    function goToPage(pageNum) {
        // Hide current page
        pages[currentPage].classList.remove('active');
        
        // Show new page
        pages[pageNum].classList.add('active');
        currentPage = pageNum;
        
    // Reset next-btn to disabled ในหน้าคำถาม
    const pageDiv = pages[pageNum];
    const nextBtn = pageDiv.querySelector('.next-btn');
    if (nextBtn && pageNum > 1 && pageNum < totalPages - 1) {
        // เฉพาะหน้าคำถามเท่านั้น
        nextBtn.disabled = true;
    }

        // Show/hide share button
        if (pageNum === totalPages - 1) {
            shareBtn.style.display = 'block';
        } else {
            shareBtn.style.display = 'none';
        }
        
        // Update navigation button states
        updateNavButtons();
        
        // Update progress text
        updateProgress();
        
        // For the summary page, update the answers
        if (pageNum === totalPages - 1) {
            updateSummary();
        }
    }
    
    // Update navigation button states
    function updateNavButtons() {
    const prevButtons = document.querySelectorAll('.prev-btn');
    const nextButtons = document.querySelectorAll('.next-btn');

    if (currentPage === totalPages - 1) {
    nextButtons.forEach(btn => {
        btn.disabled = true;
        btn.style.display = 'none'; // ซ่อนปุ่ม next ในหน้าสรุป
        });
    prevButtons.forEach(btn => {
        btn.disabled = true;
        btn.style.display = 'none'; // ซ่อนปุ่ม prev ในหน้าสรุป
        });
    } else {
    nextButtons.forEach(btn => {
        btn.disabled = false;
        btn.style.display = '';
        });
    prevButtons.forEach(btn => {
        btn.style.display = '';
        });
    }
    }
    
    // Update progress text
    function updateProgress() {
        const progressElements = document.querySelectorAll('.progress');
        if (progressElements.length > 0 && currentPage > 0) {
            const pageNum = currentPage;
            progressElements.forEach(el => {
                el.textContent = `หน้า ${pageNum}/${totalPages - 1}`;
            });
        }
    }
    
    // Update summary page with user data
    function updateSummary() {
        answersDisplay.innerHTML = '';
        
        // Calculate total points
        let totalPoints = 0;
        for (const [page, answerData] of Object.entries(userData.answers)) {
            if (page > 1 && page < totalPages - 1) { // Skip info and summary pages
                totalPoints += answerData.points;
                const answerItem = document.createElement('div');
                answerItem.className = 'answer-item';
                answerItem.innerHTML = `
                    <p><strong>${answerData.question}</strong></p>
                    <p>${answerData.answer} <span style="color: #d35400; font-weight: bold;">(คะแนน: ${answerData.points})</span></p>
                `;
                answersDisplay.appendChild(answerItem);
            }
        }
        
        // Add total points
        const totalItem = document.createElement('div');
        totalItem.className = 'answer-item';
        totalItem.style.background = '#fef9ec';
        totalItem.innerHTML = `
            <p style="font-size: 1.2rem;"><strong>คะแนนรวม: ${totalPoints} คะแนน</strong></p>
        `;
        answersDisplay.appendChild(totalItem);
        
        // Calculate risk level
        let riskLevel = riskLevels[0];
        for (const level of riskLevels) {
            if (totalPoints <= level.max) {
                riskLevel = level;
                break;
            }
        }
        
        // Update risk display
        riskPercentage.textContent = `${riskLevel.percentage}%`;
        timeEstimate.textContent = riskLevel.time;
        
        // Generate recommendation
        generateRecommendation(riskLevel, totalPoints);

                // ส่งผลการประเมินไป backend
        // ชี้ไปที่ backend บน Render
        const API_BASE = 'https://stroke2-backend.onrender.com';

        // ฟังก์ชันยิงข้อมูลไปเก็บ
        async function sendResult(payload){
        const res = await fetch(`${API_BASE}/api/submit`, {
            method: 'POST',
            headers: {'Content-Type':'application/json'},
            body: JSON.stringify(payload)
        });
        return res.json();
        }


    }
    
    // Generate personalized recommendation
    function generateRecommendation(riskLevel, totalPoints) {
        let recommendation = '';
        
        // General recommendation based on risk level
        switch(riskLevel.level) {
            case 'ต่ำมาก':
                recommendation = `
                    <p><strong>ความเสี่ยงต่ำมาก (${riskLevel.percentage}%)</strong></p>
                    <p>คุณมีความเสี่ยงต่ำมากในการเกิดโรคหลอดเลือดสมอง อย่างไรก็ตามควรดูแลสุขภาพดังนี้:</p>
                    <ul>
                        <li>ตรวจสุขภาพประจำปีสม่ำเสมอ</li>
                        <li>รักษาน้ำหนักให้อยู่ในเกณฑ์ปกติ</li>
                        <li>ออกกำลังกายอย่างน้อย 150 นาทีต่อสัปดาห์</li>
                    </ul>
                `;
                break;
            case 'ต่ำ':
                recommendation = `
                    <p><strong>ความเสี่ยงต่ำ (${riskLevel.percentage}%)</strong></p>
                    <p>คุณมีความเสี่ยงต่ำในการเกิดโรคหลอดเลือดสมอง ควรดูแลสุขภาพดังนี้:</p>
                    <ul>
                        <li>ตรวจความดันโลหิตอย่างน้อยปีละ 2 ครั้ง</li>
                        <li>ควบคุมอาหารเพื่อป้องกันเบาหวาน</li>
                        <li>งดสูบบุหรี่และจำกัดเครื่องดื่มแอลกอฮอล์</li>
                    </ul>
                `;
                break;
            case 'ปานกลาง':
                recommendation = `
                    <p><strong>ความเสี่ยงปานกลาง (${riskLevel.percentage}%)</strong></p>
                    <p>คุณมีความเสี่ยงปานกลางในการเกิดโรคหลอดเลือดสมอง ควร:</p>
                    <ul>
                        <li>ปรึกษาแพทย์เพื่อประเมินความเสี่ยงอย่างละเอียด</li>
                        <li>ควบคุมปัจจัยเสี่ยงที่แก้ไขได้ เช่น ความดันโลหิตสูง เบาหวาน</li>
                        <li>ปรับเปลี่ยนพฤติกรรมสุขภาพอย่างจริงจัง</li>
                    </ul>
                `;
                break;
            case 'สูง':
                recommendation = `
                    <p><strong>ความเสี่ยงสูง (${riskLevel.percentage}%)</strong></p>
                    <p>คุณมีความเสี่ยงสูงในการเกิดโรคหลอดเลือดสมอง ควร:</p>
                    <ul>
                        <li>ปรึกษาแพทย์โดยด่วนเพื่อรับการตรวจเพิ่มเติม</li>
                        <li>รับการรักษาโรคประจำตัวที่คุณมีอยู่</li>
                        <li>ปรับเปลี่ยนพฤติกรรมสุขภาพอย่างเคร่งครัด</li>
                        <li>เข้าร่วมโปรแกรมป้องกันโรคหลอดเลือดสมอง</li>
                    </ul>
                `;
                break;
            case 'สูงมาก':
                recommendation = `
                    <p><strong>ความเสี่ยงสูงมาก (${riskLevel.percentage}%)</strong></p>
                    <p>คุณมีความเสี่ยงสูงมากในการเกิดโรคหลอดเลือดสมอง ควร:</p>
                    <ul>
                        <li>ปรึกษาแพทย์ผู้เชี่ยวชาญทันทีเพื่อรับการรักษา</li>
                        <li>เข้ารับการตรวจวินิจฉัยอย่างละเอียด</li>
                        <li>ปฏิบัติตามแผนการรักษาอย่างเคร่งครัด</li>
                        <li>ปรับเปลี่ยนวิถีชีวิตอย่างเร่งด่วน</li>
                    </ul>
                `;
                break;
        }
        
        // Specific recommendations based on answers
        let specificRecs = '';
        
        // Check for smoking
        const smokingAnswer = Object.values(userData.answers).find(a => 
            a.question.includes('สูบบุหรี่') && a.points > 0
        );
        
        if (smokingAnswer) {
            specificRecs += `
                <p style="margin-top: 15px; color: #d35400; font-weight: bold;">คำแนะนำเพิ่มเติมสำหรับการสูบบุหรี่:</p>
                <ul>
                    <li>เลิกสูบบุหรี่โดยเร็วที่สุด</li>
                    <li>ปรึกษาแพทย์เพื่อรับคำแนะนำในการเลิกบุหรี่</li>
                    <li>ใช้ผลิตภัณฑ์ช่วยเลิกบุหรี่ เช่น แผ่นแปะนิโคติน</li>
                    <li>โทรสายด่วนเลิกบุหรี่ 1600</li>
                </ul>
            `;
        }
        
        // Check for alcohol
        const alcoholAnswer = Object.values(userData.answers).find(a => 
            a.question.includes('แอลกอฮอล์') && a.points > 0
        );
        
        if (alcoholAnswer) {
            specificRecs += `
                <p style="margin-top: 15px; color: #d35400; font-weight: bold;">คำแนะนำเพิ่มเติมสำหรับการดื่มแอลกอฮอล์:</p>
                <ul>
                    <li>ลดปริมาณการดื่มแอลกอฮอล์</li>
                    <li>จำกัดการดื่มไม่เกิน 1 แก้วต่อวันสำหรับผู้หญิง และ 2 แก้วต่อวันสำหรับผู้ชาย</li>
                    <li>มีวันหยุดดื่มอย่างน้อย 2 วันต่อสัปดาห์</li>
                    <li>เข้าร่วมกลุ่มสนับสนุนการเลิกเหล้า</li>
                </ul>
            `;
        }
        
        // Add BMI recommendation if overweight
        const weight = parseFloat(userData.weight);
        const height = parseFloat(userData.height) / 100; // convert to meters
        if (weight && height) {
            const bmi = weight / (height * height);
            if (bmi >= 25) {
                specificRecs += `
                    <p style="margin-top: 15px; color: #d35400; font-weight: bold;">คำแนะนำเพิ่มเติมสำหรับน้ำหนักตัว:</p>
                    <ul>
                        <li>ดัชนีมวลกายของคุณ: ${bmi.toFixed(1)} (${bmi >= 30 ? 'โรคอ้วน' : 'น้ำหนักเกิน'})</li>
                        <li>ตั้งเป้าหมายลดน้ำหนัก ${bmi >= 30 ? '10-15%' : '5-10%'} ของน้ำหนักปัจจุบัน</li>
                        <li>ควบคุมอาหารและออกกำลังกายสม่ำเสมอ</li>
                        <li>ปรึกษานักโภชนาการสำหรับแผนการลดน้ำหนัก</li>
                    </ul>
                `;
            }
        }
        
        // Combine recommendations
        recommendationText.innerHTML = recommendation + specificRecs;
    }
    
    // Capture result as image
    function captureResult() {
        // Hide the share button temporarily
        shareBtn.style.display = 'none';
        
        // Capture the book container
        html2canvas(bookContainer).then(canvas => {
            // Create a temporary link
            const link = document.createElement('a');
            link.download = 'ผลการประเมินความเสี่ยงโรคหลอดเลือดสมอง.png';
            link.href = canvas.toDataURL('image/png');
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            
            // Show the share button again
            shareBtn.style.display = 'block';
        });
        
    }
    
    document.addEventListener('click', function(e) {
        if (e.target && e.target.id === 'restart-btn') {
            goToPage(0);
        }
    });


    // ป้องกัน accidental goToPage ถ้าอยู่หน้าสรุป (page-10)
    document.addEventListener('keydown', function(e) {
        if (currentPage === totalPages - 1) {
            // ถ้ากด Enter, Space, ArrowLeft, ArrowRight ในหน้าสรุป
            if (
                e.key === "Enter" || e.key === " " ||
                e.key === "ArrowLeft" || e.key === "ArrowRight"
            ) {
                e.preventDefault();
                e.stopPropagation();
                return false;
            }
        }
    });

    
    // Initialize the book
    initBook();
});