// Import necessary SillyTavern globals (adjust path if your script.js is elsewhere or these are global)
// 通常这些是在 script.js 中定义的全局变量或通过模块导入
// 为了简单起见，我们假设它们是全局可访问的，或者 SillyTavern 环境已经提供了它们
// const { getContext, eventSource, event_types } = SillyTavern; // 假设 SillyTavern 对象暴露了这些

// 如果 SillyTavern 对象不可用，你可能需要这样访问（这是更常见的模式）
// 这些通常是在 SillyTavern 的主 script.js 中定义的全局变量
// const getContext = window.getContext;
// const eventSource = window.eventSource;
// const event_types = window.event_types;


jQuery(async () => {
    console.log("Table Change Listener Plugin Loaded!");

    // 确保 SillyTavern 的核心对象已加载
    if (typeof getContext !== 'function' || typeof eventSource === 'undefined' || typeof event_types === 'undefined') {
        console.error("SillyTavern core objects (getContext, eventSource, event_types) not found. Plugin cannot run.");
        toastr.error("Table Change Listener: Core ST objects not found.");
        return;
    }

    // 定义当聊天变化时要执行的回调函数
    const handleChatChange = async (chatId) => {
        console.log(`[TableChangeListener] CHAT_CHANGED event triggered. Chat ID: ${chatId}`);

        try {
            const context = getContext(); // 获取当前SillyTavern的上下文

            if (!context) {
                console.warn("[TableChangeListener] Context is not available.");
                return;
            }

            // 打印 chatMetadata 中的 sheets (表格元数据)
            if (context.chatMetadata && context.chatMetadata.sheets) {
                console.log("[TableChangeListener] Table Metadata (context.chatMetadata.sheets):", JSON.parse(JSON.stringify(context.chatMetadata.sheets)));
                // 使用 JSON.parse(JSON.stringify(...)) 来深拷贝并避免打印出 Proxy 对象内部结构
            } else {
                console.log("[TableChangeListener] No table metadata found in chatMetadata.sheets.");
            }

            // 查找包含 hash_sheets 的最新消息
            let latestMessageWithHashSheets = null;
            if (context.chat && context.chat.length > 0) {
                for (let i = context.chat.length - 1; i >= 0; i--) {
                    const message = context.chat[i];
                    if (message && message.hash_sheets) {
                        latestMessageWithHashSheets = message;
                        break;
                    }
                }
            }

            if (latestMessageWithHashSheets && latestMessageWithHashSheets.hash_sheets) {
                console.log("[TableChangeListener] Latest HashSheets found in message:", JSON.parse(JSON.stringify(latestMessageWithHashSheets.hash_sheets)));
                console.log("[TableChangeListener] Message containing HashSheets:", latestMessageWithHashSheets);


                // 尝试模拟表格插件的BASE.hashSheetsToSheets逻辑来获取“活动”的表格对象
                // 这只是一个演示，实际中你可能需要更复杂的逻辑来与表格插件交互或直接使用其API（如果暴露）
                const activeSheetsData = context.chatMetadata.sheets || [];
                const activeHashSheets = latestMessageWithHashSheets.hash_sheets;
                let reconstructedSheetsInfo = [];

                activeSheetsData.forEach(sheetData => {
                    if (activeHashSheets[sheetData.uid]) {
                        reconstructedSheetsInfo.push({
                            uid: sheetData.uid,
                            name: sheetData.name,
                            // 你可以在这里添加更多你想展示的关于这个 "活动" 表格的信息
                            // 例如，从 cellHistory 和 hashSheet 重建部分内容预览 (会比较复杂)
                            numberOfRows: activeHashSheets[sheetData.uid].length,
                            numberOfColumns: activeHashSheets[sheetData.uid][0] ? activeHashSheets[sheetData.uid][0].length : 0,
                        });
                    }
                });
                if(reconstructedSheetsInfo.length > 0) {
                    console.log("[TableChangeListener] Reconstructed Active Sheets Info (basic):", reconstructedSheetsInfo);
                }

            } else {
                console.log("[TableChangeListener] No hash_sheets found in recent chat messages.");
            }

        } catch (error) {
            console.error("[TableChangeListener] Error in handleChatChange:", error);
        }
    };

    // 监听 CHAT_CHANGED 事件
    eventSource.on(event_types.CHAT_CHANGED, handleChatChange);

    console.log("[TableChangeListener] Now listening for CHAT_CHANGED events.");
    toastr.success("Table Change Listener plugin is active and listening for table updates.");

    // 可选：在插件加载时立即触发一次检查，以获取初始状态
    // 这取决于你的具体需求，如果只想监听后续变化则不需要
    // const initialContext = getContext();
    // if (initialContext && initialContext.chat) {
    //     handleChatChange(getCurrentChatId()); // 假设 getCurrentChatId 是可用的
    // }
});
