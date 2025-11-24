"use client";
import TextField from "@/components/TextField";
import { Button } from "@/components/ui/button";
import { useWebSocket } from "@/hooks/useWebSocket";
import apiService from "@/lib/api";
import ThemeToggle from "@/theme/theme-toggle";
import { useQuery } from "@tanstack/react-query";
import { Search, Send, User } from "lucide-react";
import { useEffect, useRef, useState } from "react";

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "";
const WS_BASE_URL = process.env.NEXT_PUBLIC_API_WS_BASE_URL || "";

export default function Chat() {
	const [recipientId, setRecipientId] = useState("");
	const [recipientUsername, setRecipientUsername] = useState("");
	const [message, setMessage] = useState("");
	const [chatMessages, setChatMessages] = useState<any[]>([]);
	const [unread, setUnread] = useState<any>({});
	const messagesRef = useRef<HTMLDivElement | null>(null);
	const [searchText, setSearchText] = useState("");
	const [token, setToken] = useState<string | null>(null);
	const [isTyping, setIsTyping] = useState(false);
	let typingTimeout: any = null;
	const [recipientTyping, setRecipientTyping] = useState(false);




	useEffect(() => {
		setToken(localStorage.getItem("authToken"));
	}, []);
	const { data: searchValue } = useQuery<any>({
		queryKey: [searchText],
		enabled: !!searchText,
		queryFn: async () => {
			const res = await apiService.get(`/api/auth/all/?username=${searchText}`);
			return res;
		},
	});

	const { data: userData, isLoading: userLoading } = useQuery<any>({
		queryKey: ["userData"],
		enabled: !!token,
		queryFn: async () => {
			const res = await apiService.get(`/api/auth/me/`);
			return res;
		},
	});

	const { data: connections, isLoading: connectionLoading } = useQuery<any>({
		queryKey: ["connections"],
		enabled: !!token,
		queryFn: async () => {
			const res = await apiService.get(`/chats/connections/`);
			return res;
		},
	});

	const wsUrl = `${WS_BASE_URL}/ws/chat/`;
	const { event, send } = useWebSocket(wsUrl);
	useEffect(() => {
		if (!event) return;

		if (event.type === "history") {
			setChatMessages(event.messages);
			return;
		}
		if (event.type === "chat_message") {
			const roomUsers = event.room.replace("dm_", "").split("_");
			console.log(roomUsers.includes(recipientId))
			if (roomUsers.includes(recipientId)) {
				setChatMessages((prev) => [...prev, event]);
			} else {
				setUnread((prev: { [x: string]: any; }) => ({
					...prev,
					[event.from_user]: (prev[event.from_user] || 0) + 1,
				}));
			}
			return;
		}
		if (event.type === "notify") {
			if (event.from_user !== recipientUsername) {
				setUnread((prev: { [x: string]: any; }) => ({
					...prev,
					[event.from_user]: (prev[event.from_user] || 0) + 1,
				}));
			}
		}

		if (event.type === "typing") {
			console.log(event.type)
			const roomUsers = event.room.replace("dm_", "").split("_");

			if (roomUsers.includes(recipientId)) {
				setRecipientTyping(true);
			}
			return;
		}

		if (event.type === "stop_typing") {
			const roomUsers = event.room.replace("dm_", "").split("_");

			if (roomUsers.includes(recipientId)) {
				setRecipientTyping(false);
			}
			return;
		}
	}, [event, recipientId]);


	const handleConnectionConnect = (id: string, username: string) => {
		setRecipientId(id);
		setRecipientUsername(username);

		send({ action: "load_chat", username: username });
	};

	const handleMessageSend = () => {
		if (!message.trim() || !recipientUsername) return;
		send({
			action: "send_message",
			username: recipientUsername,
			message,
		});
		setMessage("");
	};
	const typingTimeoutRef = useRef<any>(null);
	const lastTypingSentRef = useRef<number>(0);
	const TYPING_DELAY = 2000;
	const handleInput = (e: any) => {
		setMessage(e.target.value);

		if (!recipientUsername) return;

		const now = Date.now();

		// Send "typing" only if last was >5 seconds ago
		if (now - lastTypingSentRef.current > TYPING_DELAY) {
			send({ action: "typing", username: recipientUsername });
			lastTypingSentRef.current = now;
		}

		// Reset the stop-typing timer
		if (typingTimeoutRef.current) {
			clearTimeout(typingTimeoutRef.current);
		}

		typingTimeoutRef.current = setTimeout(() => {
			send({ action: "stop_typing", username: recipientUsername });
			lastTypingSentRef.current = 0; // reset typing timer
		}, TYPING_DELAY);
	};
	useEffect(() => {
		if (event?.type === "chat_message" || event?.type === "history") {
			const container = messagesRef.current;
			if (!container) return;

			requestAnimationFrame(() => {
				container.scrollTop = container.scrollHeight;
			});
		}
	}, [event]);
	if (userLoading) {
		return <>Loading</>
	}
	return (
		<div className="flex justify-center items-center p-2">
			<div className="border grid grid-cols-[12rem_20rem] h-96 rounded-2xl shadow-2xl py-2 px-1">
				<div className="border-r overflow-hidden flex flex-col p-1 ">
					<span className="font-semibold h-7 font-oswald border-b ">
						Messages
					</span>
					<div className="py-2 overflow-y-auto flex flex-col gap-2">
						<TextField
							className="m-0"
							labelIcon={<Search className="size-2 mr-0.5 mt-0.5" />}
							label="search"
							onChange={(e) => setSearchText(e.target.value)}
							type="text"
						/>

						{(searchValue ? searchValue : connections)?.map((item: any, i: number) => {
							const username = item.username || item.connected_with.username;
							const id = item.username || item.connected_with.id;
							return (
								<div
									key={i}
									onClick={() => handleConnectionConnect(id, username)}
									className={`flex items-center gap-2 p-2 border rounded-md hover:bg-accent ${username === recipientUsername && "bg-active-background"
										}`}
								>
									<User className="size-7 bg-background rounded-full p-[5px]" />
									<div className="flex gap-1 items-center">
										<span className="font-nunito text-sm text-nowrap">
											{username}
										</span>

										{unread[username] > 0 && (
											<span className="text-xs bg-red-500 text-white px-2 py-0.5 rounded-full">
												{unread[username]}
											</span>
										)}
									</div>
								</div>
							);
						})}
					</div>
				</div>

				{/* CHAT PANEL */}
				<div className="overflow-hidden grid grid-rows-[1.75rem_1fr_3rem] p-1">

					<div className="border-b flex justify-between">
						<div className="flex justify-center items-center gap-2 ">
							<h2 className="font-normal font-nunito underline">{recipientUsername}</h2>

							{recipientTyping && (
								<span className="text-xs text-blue-500 underline animate-pulse">typing...</span>
							)}
						</div>
						<h2 className="font-semibold">
							{userData?.username} <ThemeToggle />
						</h2>
					</div>
					<div
						ref={messagesRef}
						className="scrollbar-hide overflow-y-auto px-3 pt-2"
					>
						{chatMessages.map((msg, i) => {
							const isUser = msg.username === userData.username;
							return (
								<div
									key={i}
									className={`flex mb-2 ${isUser ? "justify-end" : "justify-start"}`}
								>
									<div
										className={`max-w-[70%] rounded-2xl px-2 py-1 text-sm ${isUser
											? "bg-blue-500 text-white rounded-br-none"
											: "bg-gray-200 text-gray-800 rounded-bl-none"
											}`}
									>
										<p>{msg.message}</p>
										{msg.timestamp && (
											<span className="text-[10px] block opacity-70 text-right">
												{new Date(msg.timestamp).toLocaleTimeString([], {
													hour: "2-digit",
													minute: "2-digit",
												})}
											</span>
										)}
									</div>
								</div>
							);
						})}
					</div>
					{recipientId &&

						<div className="bg-background border-t py-2 flex items-center gap-1 ">
							<input
								type="text"
								placeholder="Type a message..."
								value={message}
								onChange={(e) => handleInput(e)}
								onKeyDown={(e) => e.key === "Enter" && handleMessageSend()}
								className="flex-1 rounded-md border px-4 py-2 text-sm outline-none"
							/>
							<Button
								variant={"outline"}
								className="cursor-pointer"
								onClick={handleMessageSend}
							>
								<Send />
							</Button>
						</div>}

				</div>
			</div>
		</div>
	);
}
