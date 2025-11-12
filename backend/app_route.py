from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import uvicorn
from typing import Dict, List, Optional, Any
from pydantic import BaseModel, validator
import logging

# 導入你的現有模組
from soulCalculate import SoulCalculate
from db_manager import get_db_connection
from db_service import create_user, get_user_data, get_scam_message, get_message_with_analysis, update_quiz_status, save_user_quiz_score, get_user_quiz_score
from GameService import GameService
from message_analyzer import analyze_message as analyze_message_logic
import json

# Pydantic 模型定義
class UserCreate(BaseModel):
    username: str
    password: str
    email: str
    
    @validator('username')
    def validate_username(cls, v):
        if len(v) < 3:
            raise ValueError('用戶名至少需要3個字符')
        return v
    
    @validator('password')
    def validate_password(cls, v):
        if len(v) < 6:
            raise ValueError('密碼至少需要6個字符')
        return v

class UserLogin(BaseModel):
    username: str
    password: str

class QuizAnswer(BaseModel):
    question_id: str
    choice: str

class QuizEvaluateRequest(BaseModel):
    user_id: int
    answers: List[QuizAnswer]

class QuizStatusUpdate(BaseModel):
    status: Optional[str] = None

class UserResponse(BaseModel):
    userid: int
    username: str
    email: str

class GameCreate(BaseModel):
    user_id: int
    game_mode: str = "normal"
    
    @validator('game_mode')
    def validate_game_mode(cls, v):
        if v not in ['normal', 'challenge']:
            raise ValueError('遊戲模式必須是 normal 或 challenge')
        return v

class GameResponse(BaseModel):
    session_id: str
    total_rounds: int
    game_mode: str
    rounds: List[Dict[str, Any]]
    status: str

class RoundResponse(BaseModel):
    round_number: int
    questions: List[Dict[str, Any]]

class UserChoice(BaseModel):
    round: int
    userChoiceId: int
    correctAnswerId: int
    isCorrect: bool

class GameAnalysisRequest(BaseModel):
    userChoices: List[UserChoice]

class MessageAnalyzeRequest(BaseModel):
    message: str

class MessageAnalysisResponse(BaseModel):
    round: int
    isCorrect: bool
    userChoice: Dict[str, Any]
    correctAnswer: Dict[str, Any]

class RoundResult(BaseModel):
    round_number: int
    user_choice_id: int
    correct_answer_id: int
    is_correct: bool
    response_time: int

class GameCompleteRequest(BaseModel):
    session_id: str
    rounds: List[RoundResult]

class LeaderboardEntry(BaseModel):
    username: str
    total_score: int
    correct_answers: int
    wrong_answers: int
    accuracy_rate: float
    speed_score: int
    correct_score: int

class APIResponse(BaseModel):
    success: bool
    message: str
    data: Optional[Any] = None
    error: Optional[str] = None

# 設定日誌
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# 建立 FastAPI 應用程式
app = FastAPI(
    title="Scam Detection API",
    description="詐騙訊息檢測 API",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS 設定 - 允許前端跨域請求
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 全域變數
# 移除 TwoStageAnalyzer 初始化，因為我們使用函數而不是類別

# 統一的響應函數
def create_response(success: bool, message: str, data: Any = None, error: str = None):
    """創建統一的 API 響應格式"""
    return APIResponse(success=success, message=message, data=data, error=error)

# 健康檢查端點
@app.get("/")
async def root():
    return {"message": "Scam Detection API 運行中", "status": "healthy"}

@app.get("/health")
async def health_check():
    """健康檢查端點"""
    try:
        # 測試資料庫連線
        conn = get_db_connection()
        if conn:
            conn.close()
            return {"status": "healthy", "database": "connected"}
        else:
            return {"status": "unhealthy", "database": "disconnected"}
    except Exception as e:
        return {"status": "unhealthy", "error": str(e)}

# 用戶管理端點 - RESTful 設計
@app.post("/users", response_model=APIResponse)
async def create_user_endpoint(user: UserCreate):
    """註冊新用戶"""
    try:
        user_id = create_user(user.username, user.password, user.email)
        if user_id is None:
            return create_response(
                success=False,
                message="註冊失敗",
                error="無法創建用戶"
            )
        return create_response(
            success=True,
            message="註冊成功",
            data={"user_id": user_id}
        )
    except Exception as e:
        logger.error(f"register user failed: {e}")
        return create_response(
            success=False,
            message="註冊失敗",
            error=str(e)
        )

@app.post("/auth/login", response_model=APIResponse)
async def login_user(user: UserLogin):
    """用戶登入"""
    try:
        user_info = get_user_data(user.username)
        
        if not user_info or user_info.get('password') != user.password:
            return create_response(
                success=False,
                message="登入失敗",
                error="用戶名或密碼錯誤"
            )

        role = user_info.get('role')
        quiz_status = user_info.get('quiz_status')

        return create_response(
            success=True,
            message="登入成功",
            data={
                "user_id": user_info.get('userid'),
                "username": user_info.get('username'),
                "email": user_info.get('email'),
                "role": role,
                "quiz_status": quiz_status
            }
        )
    except Exception as e:
        logger.error(f"login user failed: {e}")
        return create_response(
            success=False,
            message="登入失敗",
            error=str(e)
        )

@app.post("/quiz/evaluate", response_model=APIResponse)
async def evaluate_quiz(request: QuizEvaluateRequest):
    """接收測驗答案，計算三維分數並存入資料庫"""
    try:
        if not request.answers:
            return create_response(
                success=False,
                message="測驗答案不可為空",
                error="NO_ANSWERS"
            )

        soul_calc = SoulCalculate()
        scores = soul_calc.calculate_quiz_soul_score([answer.dict() for answer in request.answers])

        if scores is None:
            return create_response(
                success=False,
                message="計算測驗分數失敗",
                error="CALCULATION_FAILED"
            )

        if not save_user_quiz_score(request.user_id, scores["auth"], scores["time"], scores["motive"]):
            return create_response(
                success=False,
                message="儲存測驗分數失敗",
                error="PERSIST_FAILED"
            )

        update_quiz_status(request.user_id, "completed")

        quiz_animal = soul_calc.get_user_quiz_animal(scores, request.user_id)

        return create_response(
            success=True,
            message="測驗結果已更新",
            data={
                "scores": scores,
                "quiz_status": "completed",
                "initial_animal": quiz_animal
            }
        )
    except ValueError as e:
        return create_response(
            success=False,
            message="測驗提交資料有誤",
            error=str(e)
        )
    except Exception as e:
        logger.error(f"evaluate quiz failed: {e}")
        return create_response(
            success=False,
            message="測驗結果處理失敗",
            error=str(e)
        )

@app.get("/users/{user_id}/initial-animal", response_model=APIResponse)
async def get_initial_animal(user_id: int):
    """取得使用者的初始靈魂動物（心理測驗結果）"""
    try:
        quiz_scores = get_user_quiz_score(user_id)
        if not quiz_scores:
            return create_response(
                success=False,
                message="尚未找到心理測驗結果",
                error="QUIZ_NOT_FOUND"
            )

        soul_calc = SoulCalculate()
        animal = soul_calc.get_user_quiz_animal(quiz_scores, user_id)
        if animal is None:
            return create_response(
                success=False,
                message="無法解析初始靈魂動物",
                error="ANIMAL_NOT_FOUND"
            )

        return create_response(
            success=True,
            message="取得初始靈魂動物成功",
            data=animal
        )
    except Exception as e:
        logger.error(f"get initial animal failed: {e}")
        return create_response(
            success=False,
            message="取得初始靈魂動物失敗",
            error=str(e)
        )

@app.get("/users/{user_id}/animal", response_model=APIResponse)
async def get_current_animal(user_id: int):
    """取得合併後的靈魂動物（心理測驗 + 遊戲歷史）"""
    try:
        soul_calc = SoulCalculate()
        animal = soul_calc.get_combined_animal(user_id)
        if animal is None:
            return create_response(
                success=False,
                message="尚未找到靈魂動物",
                error="ANIMAL_NOT_AVAILABLE"
            )
        return create_response(
            success=True,
            message="取得靈魂動物成功",
            data=animal
        )
    except Exception as e:
        logger.error(f"get current animal failed: {e}")
        return create_response(
            success=False,
            message="取得靈魂動物失敗",
            error=str(e)
        )

@app.get("/users/{user_id}", response_model=APIResponse)
async def get_user(user_id: int):
    """獲取用戶信息"""
    try:
        # 先根據 user_id 查詢用戶名
        conn = get_db_connection()
        if not conn:
            return create_response(
                success=False,
                message="資料庫連接失敗",
                error="DATABASE_CONNECTION_FAILED"
            )
        
        cursor = conn.cursor()
        cursor.execute("SELECT username FROM users WHERE userid = %s", (user_id,))
        user_result = cursor.fetchone()
        cursor.close()
        conn.close()
        
        if not user_result:
            return create_response(
                success=False,
                message="用戶不存在",
                error="USER_NOT_FOUND"
            )
        
        # 使用用戶名獲取完整用戶數據
        user_data = get_user_data(user_result[0])
        if not user_data:
            return create_response(
                success=False,
                message="用戶不存在",
                error="USER_NOT_FOUND"
            )
        
        return create_response(
            success=True,
            message="獲取用戶信息成功",
            data={
                "user_id": user_data.get('userid'),
                "username": user_data.get('username'),
                "email": user_data.get('email'),
                "quiz_status": user_data.get('quiz_status')
            }
        )
    except Exception as e:
        logger.error(f"get user data failed: {e}")
        return create_response(
            success=False,
            message="獲取用戶信息失敗",
            error=str(e)
        )

@app.patch("/users/{user_id}/quiz-status", response_model=APIResponse)
async def update_user_quiz_status(user_id: int, payload: QuizStatusUpdate):
    """更新用戶心理測驗狀態"""
    try:
        if not update_quiz_status(user_id, payload.status):
            return create_response(
                success=False,
                message="更新測驗狀態失敗",
                error="UPDATE_FAILED"
            )
        return create_response(
            success=True,
            message="更新測驗狀態成功",
            data={
                "user_id": user_id,
                "quiz_status": payload.status
            }
        )
    except Exception as e:
        logger.error(f"update quiz status failed: {e}")
        return create_response(
            success=False,
            message="更新測驗狀態失敗",
            error=str(e)
        )
#詐騙題目端點
@app.get("/scam_message")
async def get_scam_message_endpoint(message_category: str, message_source: str, is_truth_message: bool):
    """取得詐騙簡訊題目"""
    try:
        message_data = get_scam_message(message_category, message_source, is_truth_message)
        if message_data:
            return {"message": "詐騙簡訊題目取得成功", "status": "success", "message_data": message_data}
        else:
            raise HTTPException(status_code=404, detail="詐騙簡訊題目不存在")
    except Exception as e:
        logger.error(f"get scam message failed: {e}")
        raise HTTPException(status_code=500, detail=f"get scam message failed: {str(e)}")

# 遊戲相關端點 - RESTful 設計
@app.post("/games", response_model=APIResponse)
async def create_game(game_request: GameCreate):
    """創建新遊戲"""
    try:
        game_service = GameService()
        result = game_service.get_round_question(game_request.user_id, game_request.game_mode)
        
        return create_response(
            success=True,
            message="遊戲創建成功",
            data=result
        )
    except Exception as e:
        logger.error(f"create game failed: {e}")
        return create_response(
            success=False,
            message="遊戲創建失敗",
            error=str(e)
        )

@app.get("/games/{session_id}/rounds/{round_number}", response_model=APIResponse)
async def get_round_questions(session_id: str, round_number: int):
    """獲取指定回合的題目"""
    try:
        if round_number < 1 or round_number > 5:
            return create_response(
                success=False,
                message="回合號必須在1-5之間",
                error="INVALID_ROUND_NUMBER"
            )
        
        game_service = GameService()
        result = game_service.get_round_by_number(session_id, round_number)
        
        if result is None:
            return create_response(
                success=False,
                message="遊戲會話不存在或回合號無效",
                error="ROUND_NOT_FOUND"
            )
        
        return create_response(
            success=True,
            message=f"第{round_number}關題目獲取成功",
            data=result
        )
    except Exception as e:
        logger.error(f"get round questions failed: {e}")
        return create_response(
            success=False,
            message="獲取回合題目失敗",
            error=str(e)
        )

# 遊戲分析端點 - RESTful 設計
@app.post("/games/analysis", response_model=APIResponse)
async def get_game_analysis(analysis_request: GameAnalysisRequest):
    """獲取遊戲中用戶選擇和正確答案的解析"""
    try:
        if not analysis_request.userChoices:
            return create_response(
                success=False,
                message="用戶選擇數據不能為空",
                error="EMPTY_USER_CHOICES"
            )
        
        analysis_results = []
        
        for choice in analysis_request.userChoices:
            round_num = choice.round
            user_choice_id = choice.userChoiceId
            correct_answer_id = choice.correctAnswerId
            is_correct = choice.isCorrect
            
            # 獲取用戶選擇的訊息和解析
            user_message = get_message_with_analysis(user_choice_id)
            correct_message = get_message_with_analysis(correct_answer_id)
            
            round_analysis = {
                "round": round_num,
                "isCorrect": is_correct,
                "userChoice": {
                    "messageId": user_choice_id,
                    "content": user_message[2] if user_message else None,
                    "category": user_message[4] if user_message else None,
                    "isTruth": user_message[3] if user_message else None,
                    "analysis": user_message[5] if user_message else None
                },
                "correctAnswer": {
                    "messageId": correct_answer_id,
                    "content": correct_message[2] if correct_message else None,
                    "category": correct_message[4] if correct_message else None,
                    "isTruth": correct_message[3] if correct_message else None,
                    "analysis": correct_message[5] if correct_message else None
                }
            }
            
            analysis_results.append(round_analysis)
        
        return create_response(
            success=True,
            message="遊戲解析獲取成功",
            data=analysis_results
        )
        
    except Exception as e:
        logger.error(f"get game analysis failed: {e}")
        return create_response(
            success=False,
            message="獲取遊戲解析失敗",
            error=str(e)
        )

@app.post("/api/analyze-message", response_model=APIResponse)
async def analyze_message_endpoint(request: MessageAnalyzeRequest):
    """分析單一文字訊息的詐騙風險"""
    try:
        # message_analyzer.analyze_message returns a JSON string, so we parse it.
        analysis_result = json.loads(analyze_message_logic(request.message))
        
        return create_response(
            success=True,
            message="訊息分析成功",
            data=analysis_result
        )
    except Exception as e:
        logger.error(f"analyze message failed: {e}")
        return create_response(
            success=False,
            message="訊息分析失敗",
            error=str(e)
        )

# ==================== 排行榜相關 API ====================

@app.post("/games/complete", response_model=APIResponse)
async def complete_game(request: GameCompleteRequest):
    """完成遊戲並記錄分數"""
    try:
        game_service = GameService()
        
        # 記錄每個回合的結果
        for round_result in request.rounds:
            success = game_service.record_round_result(
                session_id=request.session_id,
                round_number=round_result.round_number,
                user_choice_id=round_result.user_choice_id,
                correct_answer_id=round_result.correct_answer_id,
                is_correct=round_result.is_correct,
                response_time=round_result.response_time
            )
            
            if not success:
                return create_response(
                    success=False,
                    message="記錄回合結果失敗",
                    error="DATABASE_ERROR"
                )
        
        # 更新總分數
        if not game_service.update_game_score(request.session_id):
            return create_response(
                success=False,
                message="更新遊戲分數失敗",
                error="SCORE_UPDATE_ERROR"
            )
        
        # 完成遊戲會話
        if not game_service.complete_game_session(request.session_id):
            return create_response(
                success=False,
                message="完成遊戲會話失敗",
                error="SESSION_COMPLETE_ERROR"
            )
        
        # 計算並更新靈魂分數
        soul_calc = SoulCalculate()
        soul_calc.update_session_soul_score(request.session_id)
        return create_response(
            success=True,
            message="遊戲完成，分數已記錄"
        )
        
    except Exception as e:
        logger.error(f"complete game failed: {e}")
        return create_response(
            success=False,
            message="完成遊戲失敗",
            error=str(e)
        )

@app.get("/leaderboard", response_model=APIResponse)
async def get_leaderboard(limit: int = 100):
    """獲取排行榜"""
    try:
        game_service = GameService()
        leaderboard_data = game_service.get_leaderboard(limit)
        
        # 轉換為 LeaderboardEntry 格式
        leaderboard = []
        for entry in leaderboard_data:
            leaderboard.append({
                "username": entry[0],
                "total_score": entry[1],
                "correct_answers": entry[2],
                "wrong_answers": entry[3],
                "accuracy_rate": round(entry[4], 2),
                "speed_score": entry[5],
                "correct_score": entry[6]
            })
        
        return create_response(
            success=True,
            message="獲取排行榜成功",
            data=leaderboard
        )
        
    except Exception as e:
        logger.error(f"get leaderboard failed: {e}")
        return create_response(
            success=False,
            message="獲取排行榜失敗",
            error=str(e)
        )

@app.get("/users/{user_id}/game-history", response_model=APIResponse)
async def get_user_game_history(user_id: int, limit: int = 10):
    """獲取用戶遊戲歷史"""
    try:
        game_service = GameService()
        history_data = game_service.get_user_game_history(user_id, limit)
        
        # 轉換數據格式
        history = []
        for entry in history_data:
            history.append({
                "session_id": entry[0],
                "game_mode": entry[1],
                "auth": entry[2],
                "time": entry[3],
                "motive": entry[4],
                "total_score": entry[5],
                "correct_answers": entry[6],
                "wrong_answers": entry[7],
                "accuracy_rate": round(entry[8], 2),
                "speed_score": entry[9]
            })
        
        return create_response(
            success=True,
            message="獲取用戶遊戲歷史成功",
            data=history
        )
        
    except Exception as e:
        logger.error(f"get user game history failed: {e}")
        return create_response(
            success=False,
            message="獲取用戶遊戲歷史失敗",
            error=str(e)
        )

@app.get("/games/{session_id}/details", response_model=APIResponse)
async def get_game_session_details(session_id: str):
    """獲取遊戲會話詳細信息"""
    try:
        game_service = GameService()
        details = game_service.get_game_session_details(session_id)
        
        if not details:
            return create_response(
                success=False,
                message="遊戲會話不存在",
                error="SESSION_NOT_FOUND"
            )
        
        # 轉換數據格式
        session_info = details['session_info']
        rounds = details['rounds']
        
        formatted_details = {
            "session_id": session_info[0],  # session_id
            "username": session_info[1],    # username
            "game_mode": session_info[2],   # game_mode
            "status": session_info[3],      # status
            "session_soul": {
                "auth": session_info[4],
                "time": session_info[5],
                "motive": session_info[6]
            },
            "total_score": session_info[7],  # total_score
            "correct_score": session_info[8], # correct_score
            "speed_score": session_info[9],   # speed_score
            "correct_answers": session_info[10], # correct_answers
            "wrong_answers": session_info[11],   # wrong_answers
            "accuracy_rate": round(session_info[12], 2), # accuracy_rate
            "rounds": []
        }
        
        for round_data in rounds:
            formatted_details["rounds"].append({
                "round_number": round_data[0],
                "user_choice_id": round_data[1],
                "correct_answer_id": round_data[2],
                "is_correct": round_data[3],
                "response_time": round_data[4],
                "base_score": round_data[5],
                "speed_bonus": round_data[6],
                "total_round_score": round_data[7]
            })
        
        return create_response(
            success=True,
            message="獲取遊戲會話詳情成功",
            data=formatted_details
        )
        
    except Exception as e:
        logger.error(f"get game session details failed: {e}")
        return create_response(
            success=False,
            message="獲取遊戲會話詳情失敗",
            error=str(e)
        )

@app.get("/games/{session_id}/soul-score", response_model=APIResponse)
async def get_session_soul_score(session_id: str):
    """獲取遊戲會話的靈魂分數"""
    try:
        soul_calculate = SoulCalculate()
        score = soul_calculate.caculate_session_soul_score(session_id)
        return create_response(success=True, message="獲取靈魂分數成功", data=score)
    except Exception as e:
        logger.error(f"get session soul score failed: {e}")

@app.get("/users/{user_id}/animal", response_model=APIResponse)
async def get_user_animal(user_id: int):
    """獲取用戶當前靈魂動物"""
    try:
        soul_calc = SoulCalculate()
        result = soul_calc.define_user_animals(user_id)
        
        if result:
            return create_response(
                success=True,
                message="獲取靈魂動物成功",
                data=result
            )
        else:
            return create_response(
                success=False,
                message="無法計算靈魂動物",
                error="ANIMAL_CALCULATION_FAILED"
            )
    except Exception as e:
        logger.error(f"get user animal failed: {e}")
        return create_response(
            success=False,
            message="獲取靈魂動物失敗",
            error=str(e)
        )

@app.get("/users/{user_id}/history-soul-score", response_model=APIResponse)
async def get_user_history_soul_score(user_id: int):
    """獲取用戶歷史靈魂分數"""
    try:
        soul_calc = SoulCalculate()
        result = soul_calc.get_user_history_soul_score(user_id)
        return create_response(
            success=True,
            message="獲取用戶歷史靈魂分數成功",
            data=result
        )
    except Exception as e:
        logger.error(f"get user history soul score failed: {e}")
        return create_response(
            success=False,
            message="獲取用戶歷史靈魂分數失敗",
            error=str(e)
        )

# 錯誤處理
@app.exception_handler(Exception)
async def global_exception_handler(request, exc):
    logger.error(f"未處理的錯誤: {exc}")
    return JSONResponse(
        status_code=500,
        content={"detail": "內部伺服器錯誤", "error": str(exc)}
    )

if __name__ == "__main__":
    # 開發環境啟動
    uvicorn.run(
        "app_route:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    )
