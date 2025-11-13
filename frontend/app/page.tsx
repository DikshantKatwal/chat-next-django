"use client";
import TextField from "@/components/TextField";
import { Button } from "@/components/ui/button";
import { useWebSocket } from "@/hooks/useWebSocket";
import ThemeToggle from "@/theme/theme-toggle";
import { User } from "lucide-react";
import { useEffect, useRef, useState } from "react";

export default function Chat() {
	const [recipientId, setRecipientId] = useState("");
	const [socketUrl, setSocketUrl] = useState<string | null>(null);
	const [message, setMessage] = useState("");
	const [userData, setUserData] = useState<any>({});
	const [connections, setConnections] = useState<any>([]);
	const messageEndRef = useRef<HTMLDivElement | null>(null);

	useEffect(() => {
		const fetchUser = async () => {
			const token = localStorage.getItem("authToken");
			if (!token) return;
			const res = await fetch("http://127.0.0.1:8000/api/auth/me/", {
				headers: { Authorization: `Token ${token}` },
			});
			if (res.ok) setUserData(await res.json());
		};

		const fetchConnections = async () => {
			const token = localStorage.getItem("authToken");
			if (!token) return;
			const res = await fetch("http://127.0.0.1:8000/chats/connections/", {
				headers: { Authorization: `Token ${token}` },
			});
			if (res.ok) setConnections(await res.json());
		};
		fetchUser();
		fetchConnections()
	}, []);

	const { messages, send } = useWebSocket(socketUrl ?? "");
	useEffect(() => {
		messageEndRef.current?.scrollIntoView({ behavior: "smooth" });
	}, [messages]);

	const handleConnect = () => {
		const token = localStorage.getItem("authToken");
		if (!recipientId.trim() || !token) return alert("Enter recipient user ID");
		setSocketUrl(
			`ws://127.0.0.1:8000/ws/chat/?username=${recipientId}&token=${token}`
		);
	};

	const handleConnectionConnect = (username: string) => {
		const token = localStorage.getItem("authToken");
		setRecipientId(username)
		if (!username.trim() || !token) return alert("Enter recipient user ID");
		setSocketUrl(
			`ws://127.0.0.1:8000/ws/chat/?username=${username}&token=${token}`
		);
	};

	const handleMessageSend = () => {
		if (!message.trim()) return;
		send({ message });
		setMessage("");
	};
	return (
		<div className="flex justify-center items-center p-2">
			<div className="border grid grid-cols-[12rem_20rem] h-96 rounded-2xl shadow-2xl py-2 px-1">
				<div className="border-r overflow-hidden flex flex-col p-1 min-h-20">
					<span className="font-semibold font-oswald border-b ">
						Messages
					</span>
					<div className="py-2 h-[80vh] overflow-y-scroll flex flex-col gap-2">
						{
							connections?.map((connection: any, i: number) => (
								<div key={i} onClick={
									() => handleConnectionConnect(connection.connected_with.username)
								} className="flex items-center gap-2 p-2 border rounded-md hover:bg-accent">
									<User className="size-7 bg-background rounded-full p-[5px]" />
									<span className="font-nunito text-sm text-nowrap ">
										{connection.connected_with.username}
									</span>
								</div>
							))
						}
					</div>
				</div>

				<div className="flex flex-col h-[80vh]  bg-background">
					<div className="flex items-center justify-between  border-b min-h-[5rem]">
						<h2 className="font-normal font-nunito underline">{recipientId || "?"} </h2>
						<h2 className="font-semibold">{userData.username}<ThemeToggle /></h2>
					</div>

					<div className="flex-1 overflow-y-auto px-3 py-2 space-y-2">
						{messages.map((msg: any, i) => {
							const isUser = msg.username === userData.username;
							return (
								<div
									key={i}
									className={`flex ${isUser ? "justify-end" : "justify-start"}`}
								>
									<div
										className={`max-w-[70%] rounded-2xl px-3 py-2 text-sm ${isUser
											? "bg-blue-500 text-white rounded-br-none"
											: "bg-gray-200 text-gray-800 rounded-bl-none"
											}`}
									>
										<p>{msg.message}</p>
										{msg.timestamp && (
											<span className="text-[10px] block mt-1 opacity-70 text-right">
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
						<div ref={messageEndRef} />
					</div>

					<div className="border-t px-3 py-2 flex items-center gap-2">
						{!socketUrl ? (
							<>
								<TextField
									label="Recipient ID"
									type="text"
									onChange={(e) => setRecipientId(e.target.value)}
								/>
								<Button onClick={handleConnect}>Start Chat</Button>
							</>
						) : (
							<>
								<input
									type="text"
									placeholder="Type a message..."
									value={message}
									onChange={(e) => setMessage(e.target.value)}
									onKeyDown={(e) => e.key === "Enter" && handleMessageSend()}
									className="flex-1 rounded-full border border-gray-300 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
								/>
								<Button onClick={handleMessageSend}>Send</Button>
							</>
						)}
					</div>
				</div>


				{/* <div className="flex flex-col h-[80vh]  bg-background">
					<div className="flex items-center justify-between border-b px-4 py-3">
						<h2 className="font-semibold">Messages </h2>
					</div>

					{
						connections?.map((connection: any, i: number) => (
							<div key={i} className="border-y-2 p-2 font-nunito font-bold cursor-pointer hover:bg-accent"
								onClick={
									() => handleConnectionConnect(connection.connected_with.username)
								}>
								{connection.connected_with.username}
							</div>
						))
					}
				</div>
				<div className="flex flex-col h-[80vh] max-w-md mx-auto border rounded-lg shadow bg-background">
					<div className="flex items-center justify-between  px-4 py-3">
						<h2 className="font-semibold">Chat with {recipientId || "?"} </h2>
						<h2 className="font-semibold">{userData.username}<ThemeToggle /></h2>
					</div>

					<div className="flex-1 overflow-y-auto px-3 py-2 space-y-2">
						{messages.map((msg: any, i) => {
							const isUser = msg.username === userData.username;
							return (
								<div
									key={i}
									className={`flex ${isUser ? "justify-end" : "justify-start"}`}
								>
									<div
										className={`max-w-[70%] rounded-2xl px-3 py-2 text-sm ${isUser
											? "bg-blue-500 text-white rounded-br-none"
											: "bg-gray-200 text-gray-800 rounded-bl-none"
											}`}
									>
										<p>{msg.message}</p>
										{msg.timestamp && (
											<span className="text-[10px] block mt-1 opacity-70 text-right">
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
						<div ref={messageEndRef} />
					</div>

					<div className="border-t px-3 py-2 flex items-center gap-2">
						{!socketUrl ? (
							<>
								<TextField
									label="Recipient ID"
									type="text"
									onChange={(e) => setRecipientId(e.target.value)}
								/>
								<Button onClick={handleConnect}>Start Chat</Button>
							</>
						) : (
							<>
								<input
									type="text"
									placeholder="Type a message..."
									value={message}
									onChange={(e) => setMessage(e.target.value)}
									onKeyDown={(e) => e.key === "Enter" && handleMessageSend()}
									className="flex-1 rounded-full border border-gray-300 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
								/>
								<Button onClick={handleMessageSend}>Send</Button>
							</>
						)}
					</div>
				</div> */}
			</div>
		</div>

	);
}
