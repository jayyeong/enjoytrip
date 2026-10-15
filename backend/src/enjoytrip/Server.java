package enjoytrip;

import com.sun.net.httpserver.*;
import java.net.*;
import java.nio.charset.StandardCharsets;
import java.nio.file.*;
import java.io.*;
import java.util.*;
import java.util.concurrent.Executors;

/** Local demonstration server. Static assets and algorithm API share one origin. */
public final class Server {
    private static final int LIMIT=8*1024*1024;
    public static void main(String[] args)throws Exception {
        Path root=Path.of(args.length>0?args[0]:"dist").toRealPath();
        if(!Files.isRegularFile(root.resolve("index.html")))throw new IllegalArgumentException("Build dist first");
        int port=args.length>1?Integer.parseInt(args[1]):8001;
        HttpServer server=HttpServer.create(new InetSocketAddress("127.0.0.1",port),0);
        server.createContext("/api/algorithms/query",Server::query);
        server.createContext("/",e->{try{
            if(!e.getRequestMethod().equals("GET")){send(e,405,"text/plain","Method not allowed");return;}
            Path file=root.resolve(e.getRequestURI().getPath().substring(1)).normalize();
            if(Files.isDirectory(file))file=file.resolve("index.html");
            if(!file.startsWith(root)||!Files.isRegularFile(file)||!file.toRealPath().startsWith(root)){send(e,404,"text/plain","Not found");return;}
            String name=file.toString();String type=name.endsWith(".js")?"text/javascript":name.endsWith(".css")?"text/css":name.endsWith(".svg")?"image/svg+xml":name.endsWith(".png")?"image/png":"text/html";
            byte[] bytes=Files.readAllBytes(file);e.getResponseHeaders().set("Content-Type",type+"; charset=utf-8");e.sendResponseHeaders(200,bytes.length);e.getResponseBody().write(bytes);
        }catch(Exception ex){send(e,500,"text/plain","Could not serve file");}finally{e.close();}});
        server.setExecutor(Executors.newFixedThreadPool(4));server.start();System.out.println("EnjoyTrip: http://127.0.0.1:"+port);
    }
    private static void query(HttpExchange e)throws IOException {
        try {
            if(!e.getRequestMethod().equals("POST")){send(e,405,"application/json","{\"error\":\"POST required\"}");return;}
            String origin=e.getRequestHeaders().getFirst("Origin");
            if(origin!=null&&!origin.equals("http://127.0.0.1:"+e.getLocalAddress().getPort())&&!origin.equals("http://localhost:"+e.getLocalAddress().getPort())){
                send(e,403,"application/json","{\"error\":\"Origin rejected\"}");return;
            }
            byte[] bytes=e.getRequestBody().readNBytes(LIMIT+1);
            if(bytes.length>LIMIT){send(e,413,"application/json","{\"error\":\"Payload too large\"}");return;}
            Map<String,List<String>> f=new HashMap<>();
            for(String pair:new String(bytes,StandardCharsets.UTF_8).split("&")){
                String[] kv=pair.split("=",2);f.computeIfAbsent(URLDecoder.decode(kv[0],StandardCharsets.UTF_8),k->new ArrayList<>()).add(kv.length==2?URLDecoder.decode(kv[1],StandardCharsets.UTF_8):"");
            }
            List<String> ids=f.getOrDefault("id",List.of());int n=ids.size();
            if(n>10000)throw new IllegalArgumentException("최대 10000개까지 처리할 수 있습니다.");
            for(String key:List.of("title","address","lat","lon"))if(f.getOrDefault(key,List.of()).size()!=n)throw new IllegalArgumentException("관광지 데이터가 일치하지 않습니다.");
            double lat=Double.parseDouble(one(f,"originLat","0")),lon=Double.parseDouble(one(f,"originLon","0"));
            boolean sort=one(f,"sort","false").equals("true");
            if(sort&&!Algorithms.validCoordinate(lat,lon))throw new IllegalArgumentException("기준 좌표를 확인하세요.");
            String keyword=one(f,"keyword","");if(keyword.length()>500)throw new IllegalArgumentException("검색어는 500자 이내로 입력하세요.");
            List<Algorithms.Spot> spots=new ArrayList<>();
            for(int i=0;i<n;i++)spots.add(new Algorithms.Spot(ids.get(i),f.get("title").get(i),f.get("address").get(i),coordinate(f.get("lat").get(i)),coordinate(f.get("lon").get(i))));
            long start=System.nanoTime();var result=Algorithms.query(spots,keyword,lat,lon,sort);long ns=System.nanoTime()-start;
            StringJoiner rows=new StringJoiner(",");
            for(var r:result)rows.add("{\"index\":"+r.inputIndex()+",\"km\":"+(Double.isFinite(r.km())?Double.toString(r.km()):"null")+"}");
            send(e,200,"application/json","{\"rows\":["+rows+"],\"inputCount\":"+n+",\"elapsedNs\":"+ns+"}");
        }catch(IllegalArgumentException ex){send(e,400,"application/json","{\"error\":"+quote(ex.getMessage())+"}");}
        finally{e.close();}
    }
    private static double coordinate(String s){try{return Double.parseDouble(s);}catch(NumberFormatException e){return Double.NaN;}}
    private static String one(Map<String,List<String>> f,String k,String fallback){return f.getOrDefault(k,List.of(fallback)).getFirst();}
    private static String quote(String s){return "\""+s.replace("\\","\\\\").replace("\"","\\\"").replace("\n"," ").replace("\r"," ")+"\"";}
    private static void send(HttpExchange e,int code,String type,String text)throws IOException{byte[] b=text.getBytes(StandardCharsets.UTF_8);e.getResponseHeaders().set("Content-Type",type+"; charset=utf-8");e.getResponseHeaders().set("Cache-Control","no-store");e.sendResponseHeaders(code,b.length);e.getResponseBody().write(b);}
}
