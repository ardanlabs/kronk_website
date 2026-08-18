import { ThemeProvider } from "next-themes";
import { HelmetProvider } from "react-helmet-async";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { lazy, Suspense } from "react";

const Index = lazy(() => import("./pages/Index"));
const Blog = lazy(() => import("./pages/Blog"));
const BlogPost = lazy(() => import("./pages/BlogPost"));
const Manual = lazy(() => import("./pages/Manual"));
const Showcase = lazy(() => import("./pages/Showcase"));
const Sponsors = lazy(() => import("./pages/Sponsors"));
const Contributors = lazy(() => import("./pages/Contributors"));
const Privacy = lazy(() => import("./pages/Privacy"));
const Terms = lazy(() => import("./pages/Terms"));
const Bucky = lazy(() => import("./pages/Bucky"));
const Malina = lazy(() => import("./pages/Malina"));
const NotFound = lazy(() => import("./pages/NotFound"));

const queryClient = new QueryClient();

const App = () => (
  <HelmetProvider>
  <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Suspense fallback={<div />}>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/blog" element={<Blog />} />
          <Route path="/blog/posts/:slug" element={<BlogPost />} />
          <Route path="/blog/:slug" element={<BlogPost />} />
          <Route path="/manual" element={<Manual />} />
          <Route path="/bucky" element={<Bucky />} />
          <Route path="/malina" element={<Malina />} />
          <Route path="/showcase" element={<Showcase />} />
          <Route path="/sponsors" element={<Sponsors />} />
          <Route path="/contributors" element={<Contributors />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/terms" element={<Terms />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
        </Suspense>
      </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </ThemeProvider>
  </HelmetProvider>
);

export default App;
