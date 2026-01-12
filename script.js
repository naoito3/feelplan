class CalendarApp {
    constructor() {
        this.currentDate = new Date();
        this.events = JSON.parse(localStorage.getItem('calendarEvents')) || [];
        this.selectedDate = null;
        this.editingEvent = null;
        
        this.initializeElements();
        this.bindEvents();
        this.renderCalendar();
    }

    initializeElements() {
        this.calendarGrid = document.getElementById('calendarGrid');
        this.currentMonthElement = document.getElementById('currentMonth');
        this.prevMonthBtn = document.getElementById('prevMonth');
        this.nextMonthBtn = document.getElementById('nextMonth');
        this.newEventBtn = document.getElementById('newEventBtn');
        this.eventModal = document.getElementById('eventModal');
        this.eventForm = document.getElementById('eventForm');
        this.closeBtn = document.querySelector('.close');
        this.cancelBtn = document.getElementById('cancelBtn');
        
        // イベント詳細モーダル要素
        this.eventDetailModal = document.getElementById('eventDetailModal');
        this.detailClose = document.getElementById('detailClose');
        this.editEventBtn = document.getElementById('editEventBtn');
        this.deleteEventBtn = document.getElementById('deleteEventBtn');
        this.closeDetailBtn = document.getElementById('closeDetailBtn');
    }

    bindEvents() {
        this.prevMonthBtn.addEventListener('click', () => this.previousMonth());
        this.nextMonthBtn.addEventListener('click', () => this.nextMonth());
        this.newEventBtn.addEventListener('click', () => this.openEventModal());
        this.closeBtn.addEventListener('click', () => this.closeEventModal());
        this.cancelBtn.addEventListener('click', () => this.closeEventModal());
        this.eventForm.addEventListener('submit', (e) => this.handleEventSubmit(e));
        
        // イベント詳細モーダルのイベント
        this.detailClose.addEventListener('click', () => this.closeEventDetailModal());
        this.closeDetailBtn.addEventListener('click', () => this.closeEventDetailModal());
        this.editEventBtn.addEventListener('click', () => this.editEvent());
        this.deleteEventBtn.addEventListener('click', () => this.deleteEvent());
        
        // モーダル外クリックで閉じる
        this.eventModal.addEventListener('click', (e) => {
            if (e.target === this.eventModal) {
                this.closeEventModal();
            }
        });
        
        this.eventDetailModal.addEventListener('click', (e) => {
            if (e.target === this.eventDetailModal) {
                this.closeEventDetailModal();
            }
        });
    }

    renderCalendar() {
        const year = this.currentDate.getFullYear();
        const month = this.currentDate.getMonth();
        
        // 月表示を更新
        this.currentMonthElement.textContent = `${year}年 ${month + 1}月`;
        
        // カレンダーグリッドをクリア
        this.calendarGrid.innerHTML = '';
        
        // 曜日ヘッダーを追加
        const dayHeaders = ['日', '月', '火', '水', '木', '金', '土'];
        dayHeaders.forEach(day => {
            const dayHeader = document.createElement('div');
            dayHeader.className = 'day-header';
            dayHeader.textContent = day;
            this.calendarGrid.appendChild(dayHeader);
        });
        
        // 月の最初の日を取得
        const firstDay = new Date(year, month, 1);
        const startDate = new Date(firstDay);
        startDate.setDate(startDate.getDate() - firstDay.getDay());
        
        // 6週間分の日付を表示
        for (let week = 0; week < 6; week++) {
            for (let day = 0; day < 7; day++) {
                const currentDate = new Date(startDate);
                currentDate.setDate(startDate.getDate() + (week * 7) + day);
                
                const dayCell = this.createDayCell(currentDate, month);
                this.calendarGrid.appendChild(dayCell);
            }
        }
    }

    createDayCell(date, currentMonth) {
        const dayCell = document.createElement('div');
        dayCell.className = 'day-cell';
        
        if (date.getMonth() !== currentMonth) {
            dayCell.classList.add('other-month');
        }
        
        const dayNumber = document.createElement('div');
        dayNumber.className = 'day-number';
        dayNumber.textContent = date.getDate();
        dayCell.appendChild(dayNumber);
        
        // この日のイベントを表示
        const dayEvents = this.getEventsForDate(date);
        dayEvents.forEach(event => {
            const eventElement = document.createElement('div');
            eventElement.className = 'event';
            eventElement.style.backgroundColor = event.color;
            eventElement.textContent = `${event.startTime} ${event.name}`;
            eventElement.title = `${event.name}\n場所: ${event.location}\nインストラクター: ${event.instructor}\n時間: ${event.startTime} - ${event.endTime}`;
            
            // イベントクリックで詳細表示
            eventElement.addEventListener('click', (e) => {
                e.stopPropagation();
                this.showEventDetail(event);
            });
            
            dayCell.appendChild(eventElement);
        });
        
        // 日付セルクリックでイベント作成
        dayCell.addEventListener('click', () => {
            this.selectedDate = new Date(date);
            this.openEventModal(date);
        });
        
        return dayCell;
    }

    getEventsForDate(date) {
        const dateString = this.formatDate(date);
        return this.events.filter(event => event.date === dateString);
    }

    formatDate(date) {
        // タイムゾーンの影響を避けるため、ローカル日付を使用
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    }

    previousMonth() {
        this.currentDate.setMonth(this.currentDate.getMonth() - 1);
        this.renderCalendar();
    }

    nextMonth() {
        // 1ヶ月後までの制限をチェック
        const today = new Date();
        const oneMonthLater = new Date(today);
        oneMonthLater.setMonth(today.getMonth() + 1);
        
        const nextMonth = new Date(this.currentDate);
        nextMonth.setMonth(this.currentDate.getMonth() + 1);
        
        if (nextMonth <= oneMonthLater) {
            this.currentDate.setMonth(this.currentDate.getMonth() + 1);
            this.renderCalendar();
        } else {
            alert('表示できるのは1ヶ月後までです。');
        }
    }

    openEventModal(date = null) {
        this.eventModal.style.display = 'block';
        
        if (this.editingEvent) {
            // 編集モードの場合、既存のデータを入力
            document.getElementById('eventLocation').value = this.editingEvent.location;
            document.getElementById('eventName').value = this.editingEvent.name;
            document.getElementById('eventDate').value = this.editingEvent.date;
            document.getElementById('startTime').value = this.editingEvent.startTime;
            document.getElementById('endTime').value = this.editingEvent.endTime;
            document.getElementById('instructor').value = this.editingEvent.instructor;
            document.getElementById('eventColor').value = this.editingEvent.color;
        } else {
            // 新規作成モードの場合
            this.eventForm.reset();
            if (date) {
                document.getElementById('eventDate').value = this.formatDate(date);
            } else {
                document.getElementById('eventDate').value = this.formatDate(new Date());
            }
        }
    }

    closeEventModal() {
        this.eventModal.style.display = 'none';
        this.selectedDate = null;
        this.editingEvent = null;
    }

    handleEventSubmit(e) {
        e.preventDefault();
        
        const eventData = {
            id: this.editingEvent ? this.editingEvent.id : Date.now(),
            location: document.getElementById('eventLocation').value,
            name: document.getElementById('eventName').value,
            date: document.getElementById('eventDate').value,
            startTime: document.getElementById('startTime').value,
            endTime: document.getElementById('endTime').value,
            instructor: document.getElementById('instructor').value,
            color: document.getElementById('eventColor').value
        };
        
        // 時刻の妥当性チェック
        if (eventData.startTime >= eventData.endTime) {
            alert('終了時刻は開始時刻より後に設定してください。');
            return;
        }
        
        // 日付の妥当性チェック（1ヶ月後まで）
        const eventDate = new Date(eventData.date);
        const today = new Date();
        const oneMonthLater = new Date(today);
        oneMonthLater.setMonth(today.getMonth() + 1);
        
        if (eventDate > oneMonthLater) {
            alert('イベントは1ヶ月後までしか作成できません。');
            return;
        }
        
        if (this.editingEvent) {
            // 編集モード：既存のイベントを更新
            const index = this.events.findIndex(event => event.id === this.editingEvent.id);
            if (index !== -1) {
                this.events[index] = eventData;
            }
            alert('イベントが更新されました！');
        } else {
            // 新規作成モード：新しいイベントを追加
            this.events.push(eventData);
            alert('イベントが作成されました！');
        }
        
        this.saveEvents();
        this.renderCalendar();
        this.closeEventModal();
    }

    showEventDetail(event) {
        document.getElementById('detailName').textContent = event.name;
        document.getElementById('detailLocation').textContent = event.location;
        document.getElementById('detailDate').textContent = this.formatDateForDisplay(event.date);
        document.getElementById('detailTime').textContent = `${event.startTime} - ${event.endTime}`;
        document.getElementById('detailInstructor').textContent = event.instructor;
        
        this.editingEvent = event;
        this.eventDetailModal.style.display = 'block';
    }

    closeEventDetailModal() {
        this.eventDetailModal.style.display = 'none';
        this.editingEvent = null;
    }

    editEvent() {
        this.closeEventDetailModal();
        this.openEventModal();
    }

    deleteEvent() {
        if (confirm('このイベントを削除しますか？')) {
            this.events = this.events.filter(event => event.id !== this.editingEvent.id);
            this.saveEvents();
            this.renderCalendar();
            this.closeEventDetailModal();
            alert('イベントが削除されました。');
        }
    }

    formatDateForDisplay(dateString) {
        // 日付文字列から直接パースしてタイムゾーンの影響を避ける
        const [year, month, day] = dateString.split('-');
        return `${year}年${parseInt(month)}月${parseInt(day)}日`;
    }

    saveEvents() {
        localStorage.setItem('calendarEvents', JSON.stringify(this.events));
    }
}

// アプリケーション初期化
document.addEventListener('DOMContentLoaded', () => {
    new CalendarApp();
});