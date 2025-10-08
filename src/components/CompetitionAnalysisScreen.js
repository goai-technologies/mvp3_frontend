import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useApp } from '../context/AppContext';
import apiService from '../services/api';

const CompetitionAnalysisScreen = () => {
  const { showNotification } = useApp();
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisProgress, setAnalysisProgress] = useState(null);
  const [latestAnalysis, setLatestAnalysis] = useState(null);
  const [historicalAnalyses, setHistoricalAnalyses] = useState([]);
  const [formData, setFormData] = useState({
    domain: '',
    brand_name: ''
  });

  // Load initial data
  useEffect(() => {
    loadLatestAnalysis();
    loadHistoricalAnalyses();
  }, []);

  const loadLatestAnalysis = async () => {
    try {
      // For demo purposes, using the sample data provided
      const sampleAnalysis = {
        "analysis_id": "c08c4694-3b4c-4e6c-addd-f84a5c84467b",
        "timestamp": "2025-10-05T16:49:08.810776",
        "brand": "Infosys",
        "domain": "infosys.com",
        "analysis": {
          "answers": [
            {"id":1,"question":"What is Infosys' unique value proposition in the digital transformation space compared to its competitors?","answer":"Infosys' unique value proposition is encapsulated by the five elements listed below that apply to how enterprises build their products, services, and experiences, with AI infused in every element to create additional value.","evaluation":"Correct","confidence":100,"explanation":"The context directly states, 'At Infosys, we have evolved how we deliver digital transformations to address these challenges, encapsulated by the five elements listed below that apply to how enterprises build their products, services, and experiences, with AI infused in every element to create additional value.'"},
            {"id":2,"question":"How does Infosys leverage AI in its digital operating model to improve client outcomes?","answer":"Infosys leverages AI by integrating it into the digital operating model to 'create additional value' for client outcomes.","evaluation":"Correct","confidence":100,"explanation":"The context states, 'At Infosys, we have evolved how we deliver digital transformations to address these challenges, encapsulated by the five elements listed below that apply to how enterprises build their products, services, and experiences, with AI infused in every element to create additional value.'"},
            {"id":3,"question":"Can you provide examples of how Infosys' product-centric value delivery has benefited specific industries?","answer":"Infosys Product Centric Value Delivery helps clients seamlessly make this shift from a project to a product, platform-led delivery.","evaluation":"Partially Correct","confidence":85,"explanation":"The context indicates 'Infosys Product Centric Value Delivery, with industry-specific blueprints, product and objectives, and key results (OKR) catalogs helps clients seamlessly make this shift from a project to a product, platform-led delivery' but does not specify particular industries. This is one allowed inference."},
            {"id":4,"question":"What are the key differentiators of Infosys' cloud offerings, particularly Infosys Cobalt, compared to other cloud service providers?","answer":"Infosys Cobalt provides the knowledge, IP, and tools to bring this to life.","evaluation":"Incorrect","confidence":0,"explanation":"The context does not specify how Infosys Cobalt differentiates itself compared to other cloud service providers. It only mentions 'Infosys Cobalt provide the knowledge, IP, and tools to bring this to life' which is too vague to determine differentiation."},
            {"id":5,"question":"How does Infosys ensure quality in application development and maintenance services?","answer":"Infosys ensures quality by using automation-focused platforms and tools to drive velocity, coupled with advanced engineering practices, to achieve engineering excellence.","evaluation":"Correct","confidence":100,"explanation":"The context explicitly states, 'We use automation-focused platforms and tools to drive velocity, coupled with advanced engineering practices, to achieve engineering excellence as we partner with clients.'"},
            {"id":6,"question":"What specific strategies does Infosys use to address industry-specific challenges in sectors like healthcare and financial services?","answer":"Infosys uses industry-specific blueprints and OKR catalogs to help clients make the shift from a project to a product, platform-led delivery.","evaluation":"Partially Correct","confidence":80,"explanation":"The context states 'Infosys Product Centric Value Delivery, with industry-specific blueprints, product and objectives, and key results (OKR) catalogs helps clients seamlessly make this shift from a project to a product, platform-led delivery,' but does not specify healthcare and financial services directly."},
            {"id":7,"question":"How does Infosys' approach to digital experience design, including AR, VR, and XR, enhance customer engagement?","answer":"Infosys enhances customer engagement by leveraging augmented reality, virtual reality, and extended reality (AR, VR, and XR) technologies.","evaluation":"Correct","confidence":100,"explanation":"The context states, 'This is further amplified by machine-assisted design, leveraging augmented reality, virtual reality, and extended reality (AR, VR, and XR) technologies.'"},
            {"id":8,"question":"What measures does Infosys take to maintain cybersecurity across its digital solutions?","answer":"Infosys ensures privacy, security, green IT, and ethical AI principles are baked into their design and delivery.","evaluation":"Correct","confidence":100,"explanation":"The context states, 'Our ‘Responsible by design’ approach ensures privacy, security, green IT, and ethical AI principles are baked into our design and delivery.'"},
            {"id":9,"question":"How does Infosys' partnership ecosystem contribute to its market positioning and strategy?","answer":"Infosys has a thriving network with leading technology companies that include hyperscalers, product vendors, cloud service providers, and other alliances.","evaluation":"Correct","confidence":100,"explanation":"The context states, 'Infosys has a thriving network with leading technology companies that include hyperscalers, product vendors, cloud service providers, and other alliances.'"},
            {"id":10,"question":"What is the ROI clients can expect from implementing Infosys' digital operating model?","answer":"Infosys' digital operating model results in business outcomes like innovation, reduction in total cost of ownership (TCO), brand perception, enhanced net promoter score (NPS), and more.","evaluation":"Correct","confidence":100,"explanation":"The context states, 'We have seamlessly integrated these elements into how we partner with our clients in their digital journeys, with resultant business outcomes that range from innovation, reduction in total cost of ownership (TCO), brand perception, enhanced net promoter score (NPS), and more.'"},
            {"id":11,"question":"How does Infosys manage and govern data to ensure it is leveraged effectively across digital transformations?","answer":"Infosys creates a data-first organization with a live data foundation, trusted data, connected data ecosystems, robust data governance practices, and AI-enabled products.","evaluation":"Correct","confidence":100,"explanation":"The context provides, 'A live data foundation enables utilization of ‘trusted data’, builds connected data ecosystems, implements robust data governance practices, and forms the bedrock for designing and rolling out AI-enabled products and services at scale.'"},
            {"id":12,"question":"What competitive advantages does Infosys offer in the realm of AI and machine learning services?","answer":"Infosys provides an AI-first set of services, solutions, and platforms using traditional and generative AI technologies.","evaluation":"Correct","confidence":100,"explanation":"The context states, 'Infosys Topaz provides an AI-first set of services, solutions, and platforms using traditional and generative AI technologies.'"},
            {"id":13,"question":"How does Infosys' Infosys Topaz platform enhance data analytics and AI capabilities for clients?","answer":"Infosys Topaz provides an AI-first set of services, solutions, and platforms.","evaluation":"Correct","confidence":100,"explanation":"The context states, 'Infosys Topaz provides an AI-first set of services, solutions, and platforms using traditional and generative AI technologies.'"},
            {"id":14,"question":"What role does Infosys' global learning partnerships play in talent transformation and upskilling?","answer":"Infosys' omnichannel digital learning platform, Infosys Wingspan, brings these benefits to clients as well.","evaluation":"Partially Correct","confidence":90,"explanation":"The context states, 'Our omnichannel digital learning platform, Infosys Wingspan, brings these benefits to clients as well,' but the specific role of global learning partnerships is not explicitly mentioned, only inferred."},
            {"id":15,"question":"How does Infosys differentiate its engineering services to achieve excellence in client projects?","answer":"Infosys uses an engineering ecosystem to accentuate developer experience and ensure engineering excellence.","evaluation":"Correct","confidence":100,"explanation":"The context states, 'This architecture-first approach is complemented by an engineering ecosystem to accentuate developer experience.'"},
            {"id":16,"question":"What are the benefits of Infosys' live enterprise suite for companies undergoing digital transformation?","answer":"The Infosys Live Enterprise Suite helps companies be resilient and navigate their next in digital transformation.","evaluation":"Incorrect","confidence":0,"explanation":"The context mentions 'Being Resilient. That's Live Enterprise.' but does not provide specific benefits of the Infosys Live Enterprise Suite for digital transformation."},
            {"id":17,"question":"How does Infosys's digital operating model address the need for agility and speed in decision-making?","answer":"A data-first approach enables agility and speed in decision-making.","evaluation":"Correct","confidence":100,"explanation":"The context states, 'A data-first approach brings all the critical organizational data and knowledge together in a consumable manner for systems to become intelligent, for processes to enable agility and speed in decision-making.'"},
            {"id":18,"question":"What is Infosys' approach to sustainability within its technology and innovation strategies?","answer":"Infosys incorporates sustainability services and emphasizes responsible by design principles.","evaluation":"Partially Correct","confidence":80,"explanation":"The context mentions 'Infosys Sustainability Services' and 'Responsible by design’ approach ensures privacy, security, green IT, and ethical AI principles,' but does not provide a comprehensive sustainability strategy."},
            {"id":19,"question":"How does Infosys ensure that its digital solutions are aligned with client business expectations and goals?","answer":"Infosys focuses on customer-centricity and sustainable innovation.","evaluation":"Partially Correct","confidence":85,"explanation":"The context highlights 'a lack of focus on customer-centricity, sustainable innovation' as issues Infosys addresses, but does not detail how alignment with client goals is ensured."},
            {"id":20,"question":"What are some case studies where Infosys successfully reduced the total cost of ownership for its clients?","answer":"The context mentions reduction in total cost of ownership (TCO) but does not provide specific case studies.","evaluation":"Incorrect","confidence":0,"explanation":"No specific case studies are provided in the context regarding reduction in total cost of ownership."},
            {"id":21,"question":"How does Infosys' consulting services enhance change management during digital transformation projects?","answer":"Infosys Consulting helps our clients with change management to realize the full potential of their transformation journey.","evaluation":"Correct","confidence":100,"explanation":"The context states, 'Infosys Consulting helps our clients with change management to realize the full potential of their transformation journey and drive adoption at scale.'"},
            {"id":22,"question":"What specific market trends does Infosys anticipate affecting its future growth and offerings?","answer":"Infosys anticipates trends like the need for AI-led digital transformation and a shift towards customer-centric strategies.","evaluation":"Partially Correct","confidence":85,"explanation":"The context discusses the importance of AI-led digital transformations and customer-centricity but does not explicitly state future market trends."},
            {"id":23,"question":"How does Infosys' Infosys Wingspan platform contribute to digital skills development for clients?","answer":"Infosys Wingspan is an omnichannel digital learning platform that brings learning benefits to clients.","evaluation":"Correct","confidence":100,"explanation":"The context states, 'Our omnichannel digital learning platform, Infosys Wingspan, brings these benefits to clients as well.'"},
            {"id":24,"question":"What are the unique features of Infosys' blockchain and IoT services that set it apart from competitors?","answer":"Infosys blockchain for contract performance and IoT for real-time data processing are unique features.","evaluation":"Partially Correct","confidence":80,"explanation":"The context mentions 'Blockchain for Contract performance' and IoT's role in real-time data processing but does not explicitly compare to competitors."},
            {"id":25,"question":"How does Infosys measure and improve customer satisfaction across its digital transformation services?","answer":"Infosys measures client outcomes through enhanced net promoter score (NPS).","evaluation":"Correct","confidence":100,"explanation":"The context states, 'We have seamlessly integrated these elements into how we partner with our clients in their digital journeys, with resultant business outcomes that range from... enhanced net promoter score (NPS).' This implies measuring and improving customer satisfaction."}
          ],
          "summary": {
            "total_questions": 25,
            "correct": 14,
            "partially_correct": 7,
            "incorrect": 4,
            "accuracy_percent": 76
          }
        },
        "competitor_analyses": [
          {
            "brand": "Tata Consultancy Services",
            "domain": "tcs.com",
            "analysis": {
              "answers": [
                {
                  "id": 1,
                  "question": "How does Infosys' market share compare to Tata Consultancy Services in the IT services industry?",
                  "answer": "The context does not provide specific information about Infosys' market share compared to Tata Consultancy Services.",
                  "evaluation": "Incorrect",
                  "confidence": 50,
                  "explanation": "The context focuses on Tata Consultancy Services and does not mention Infosys or provide comparative market share data."
                },
                {
                  "id": 4,
                  "question": "In terms of cloud services, how does Infosys' product suite compare to Accenture's?",
                  "answer": "The context does not provide information on Infosys' or Accenture's cloud services.",
                  "evaluation": "Incorrect",
                  "confidence": 50,
                  "explanation": "The context is specific to Tata Consultancy Services and does not mention Infosys or Accenture."
                },
                {
                  "id": 6,
                  "question": "How do the AI capabilities of IBM differ from those offered by Infosys?",
                  "answer": "The context does not provide information on the AI capabilities of IBM or Infosys.",
                  "evaluation": "Incorrect",
                  "confidence": 50,
                  "explanation": "The context is focused on Tata Consultancy Services and does not include details about IBM or Infosys."
                },
                {
                  "id": 10,
                  "question": "How do Infosys and Cognizant compare in terms of their sustainability initiatives?",
                  "answer": "The context does not provide information on the sustainability initiatives of Infosys or Cognizant.",
                  "evaluation": "Incorrect",
                  "confidence": 50,
                  "explanation": "The context is specific to Tata Consultancy Services and does not mention Infosys or Cognizant."
                },
                {
                  "id": 12,
                  "question": "How does the cybersecurity service offering of Infosys compare to that of Wipro?",
                  "answer": "The context does not provide information on the cybersecurity service offerings of Infosys or Wipro.",
                  "evaluation": "Incorrect",
                  "confidence": 50,
                  "explanation": "The context is focused on Tata Consultancy Services and does not mention Infosys or Wipro."
                }
              ],
              "summary": {
                "total_questions": 25,
                "correct": 3,
                "partially_correct": 0,
                "incorrect": 22,
                "accuracy_percent": 12
              }
            }
          },
          {
            "brand": "Accenture",
            "domain": "accenture.com",
            "analysis": {
              "answers": [
                {
                  "id": 1,
                  "question": "How does Infosys' market share compare to Tata Consultancy Services in the IT services industry?",
                  "answer": "The context does not provide information about Infosys' market share compared to Tata Consultancy Services.",
                  "evaluation": "Incorrect",
                  "confidence": 0,
                  "explanation": "The provided context does not mention Infosys or Tata Consultancy Services, nor does it discuss market share comparisons."
                },
                {
                  "id": 4,
                  "question": "In terms of cloud services, how does Infosys' product suite compare to Accenture's?",
                  "answer": "The context provides information about Accenture's cloud capabilities but does not mention Infosys.",
                  "evaluation": "Incorrect",
                  "confidence": 0,
                  "explanation": "The context only details Accenture's cloud services and does not provide any information about Infosys."
                },
                {
                  "id": 6,
                  "question": "How do the AI capabilities of IBM differ from those offered by Infosys?",
                  "answer": "The context does not provide information about the AI capabilities of IBM or Infosys.",
                  "evaluation": "Incorrect",
                  "confidence": 0,
                  "explanation": "The context does not mention IBM or Infosys, nor does it discuss their AI capabilities."
                },
                {
                  "id": 10,
                  "question": "How do Infosys and Cognizant compare in terms of their sustainability initiatives?",
                  "answer": "The context does not provide information about sustainability initiatives of Infosys or Cognizant.",
                  "evaluation": "Incorrect",
                  "confidence": 0,
                  "explanation": "The context does not mention Infosys or Cognizant, nor does it discuss their sustainability initiatives."
                },
                {
                  "id": 12,
                  "question": "How does the cybersecurity service offering of Infosys compare to that of Wipro?",
                  "answer": "The context provides information about Accenture's cybersecurity capabilities but does not mention Infosys or Wipro.",
                  "evaluation": "Incorrect",
                  "confidence": 0,
                  "explanation": "The context does not mention Infosys or Wipro, nor does it discuss their cybersecurity offerings."
                }
              ],
              "summary": {
                "total_questions": 25,
                "correct": 0,
                "partially_correct": 0,
                "incorrect": 25,
                "accuracy_percent": 0
              }
            }
          },
          {
            "brand": "Cognizant",
            "domain": "cognizant.com",
            "analysis": {
              "answers": [
                {
                  "id": 1,
                  "question": "How does Infosys' market share compare to Tata Consultancy Services in the IT services industry?",
                  "answer": "The context does not provide specific information on the market share comparison between Infosys and Tata Consultancy Services.",
                  "evaluation": "Incorrect",
                  "confidence": 50,
                  "explanation": "The context does not mention Infosys or Tata Consultancy Services, nor does it provide any market share data."
                },
                {
                  "id": 4,
                  "question": "In terms of cloud services, how does Infosys' product suite compare to Accenture's?",
                  "answer": "The context does not provide information on Infosys or Accenture's cloud services.",
                  "evaluation": "Incorrect",
                  "confidence": 50,
                  "explanation": "The context does not mention Infosys or Accenture, nor does it provide details on their cloud services."
                },
                {
                  "id": 6,
                  "question": "How do the AI capabilities of IBM differ from those offered by Infosys?",
                  "answer": "The context does not provide information on the AI capabilities of IBM or Infosys.",
                  "evaluation": "Incorrect",
                  "confidence": 50,
                  "explanation": "The context does not mention IBM or Infosys, nor does it discuss their AI capabilities."
                },
                {
                  "id": 10,
                  "question": "How do Infosys and Cognizant compare in terms of their sustainability initiatives?",
                  "answer": "The context does not provide information on sustainability initiatives for Infosys or Cognizant.",
                  "evaluation": "Incorrect",
                  "confidence": 50,
                  "explanation": "The context does not mention sustainability initiatives for either company."
                },
                {
                  "id": 12,
                  "question": "How does the cybersecurity service offering of Infosys compare to that of Wipro?",
                  "answer": "The context does not provide information on cybersecurity service offerings for Infosys or Wipro.",
                  "evaluation": "Incorrect",
                  "confidence": 50,
                  "explanation": "The context does not mention cybersecurity services for either company."
                }
              ],
              "summary": {
                "total_questions": 25,
                "correct": 25,
                "partially_correct": 0,
                "incorrect": 0,
                "accuracy_percent": 100
              }
            }
          },
          {
            "brand": "Wipro",
            "domain": "wipro.com",
            "analysis": {
              "answers": [
                {
                  "id": 1,
                  "question": "How does Infosys' market share compare to Tata Consultancy Services in the IT services industry?",
                  "answer": "The context does not provide specific information about Infosys' market share compared to Tata Consultancy Services.",
                  "evaluation": "Incorrect",
                  "confidence": 0,
                  "explanation": "The context does not mention Infosys or Tata Consultancy Services, nor does it provide market share data."
                },
                {
                  "id": 4,
                  "question": "In terms of cloud services, how does Infosys' product suite compare to Accenture's?",
                  "answer": "The context does not provide specific information about Infosys' cloud services compared to Accenture's.",
                  "evaluation": "Incorrect",
                  "confidence": 0,
                  "explanation": "The context does not mention Infosys or Accenture's cloud services."
                },
                {
                  "id": 6,
                  "question": "How do the AI capabilities of IBM differ from those offered by Infosys?",
                  "answer": "The context does not provide specific information about IBM's AI capabilities compared to Infosys'.",
                  "evaluation": "Incorrect",
                  "confidence": 0,
                  "explanation": "The context does not mention IBM or Infosys' AI capabilities."
                },
                {
                  "id": 10,
                  "question": "How do Infosys and Cognizant compare in terms of their sustainability initiatives?",
                  "answer": "The context does not provide specific information about sustainability initiatives of Infosys compared to Cognizant.",
                  "evaluation": "Incorrect",
                  "confidence": 0,
                  "explanation": "The context does not mention Infosys or Cognizant's sustainability initiatives."
                },
                {
                  "id": 12,
                  "question": "How does the cybersecurity service offering of Infosys compare to that of Wipro?",
                  "answer": "The context provides details on Wipro's cybersecurity services but does not mention Infosys' offerings for comparison.",
                  "evaluation": "Partially Correct",
                  "confidence": 60,
                  "explanation": "The context includes information on Wipro's cybersecurity services but lacks details on Infosys."
                }
              ],
              "summary": {
                "total_questions": 25,
                "correct": 0,
                "partially_correct": 0,
                "incorrect": 25,
                "accuracy_percent": 0
              }
            }
          },
          {
            "brand": "IBM",
            "domain": "ibm.com",
            "analysis": {
              "answers": [
                {
                  "id": 1,
                  "question": "How does Infosys' market share compare to Tata Consultancy Services in the IT services industry?",
                  "answer": "The context does not provide specific information on Infosys' market share compared to Tata Consultancy Services.",
                  "evaluation": "Incorrect",
                  "confidence": 50,
                  "explanation": "The provided context does not mention Infosys or Tata Consultancy Services, nor does it discuss market share comparisons."
                },
                {
                  "id": 4,
                  "question": "In terms of cloud services, how does Infosys' product suite compare to Accenture's?",
                  "answer": "The context does not provide specific information on Infosys' cloud services compared to Accenture's.",
                  "evaluation": "Incorrect",
                  "confidence": 50,
                  "explanation": "The context does not mention Infosys or Accenture's cloud services."
                },
                {
                  "id": 6,
                  "question": "How do the AI capabilities of IBM differ from those offered by Infosys?",
                  "answer": "The context provides detailed information on IBM's AI capabilities but does not mention Infosys.",
                  "evaluation": "Incorrect",
                  "confidence": 50,
                  "explanation": "The context only discusses IBM's AI capabilities and does not provide a comparison with Infosys."
                },
                {
                  "id": 10,
                  "question": "How do Infosys and Cognizant compare in terms of their sustainability initiatives?",
                  "answer": "The context does not provide specific information on the sustainability initiatives of Infosys or Cognizant.",
                  "evaluation": "Incorrect",
                  "confidence": 50,
                  "explanation": "The context does not mention sustainability initiatives for either Infosys or Cognizant."
                },
                {
                  "id": 12,
                  "question": "How does the cybersecurity service offering of Infosys compare to that of Wipro?",
                  "answer": "The context does not provide specific information on the cybersecurity service offerings of Infosys or Wipro.",
                  "evaluation": "Incorrect",
                  "confidence": 50,
                  "explanation": "The context does not mention cybersecurity services for either Infosys or Wipro."
                }
              ],
              "summary": {
                "total_questions": 25,
                "correct": 25,
                "partially_correct": 0,
                "incorrect": 0,
                "accuracy_percent": 100
              }
            }
          }
        ]
      };
      
      setLatestAnalysis(sampleAnalysis);
      
      // In production, use: const analysis = await apiService.getLatestCompetitionAnalysis();
    } catch (error) {
      console.error('Error loading latest analysis:', error);
    }
  };

  const loadHistoricalAnalyses = async () => {
    try {
      const response = await apiService.getAllCompetitionAnalyses();
      const analyses = Array.isArray(response?.analyses) ? response.analyses : (Array.isArray(response) ? response : []);
      const normalized = analyses.map(a => ({
        analysis_id: a.analysis_id,
        timestamp: a.timestamp,
        brand: a.brand,
        domain: a.domain,
        summary: {
          accuracy_percent: a.analysis?.summary?.accuracy_percent ?? a.summary?.accuracy_percent ?? 0,
          competitor_count: Array.isArray(a.competitor_analyses) ? a.competitor_analyses.length : (a.summary?.competitor_count ?? 0)
        },
        // keep full object for "View"
        _full: a
      }));
      setHistoricalAnalyses(normalized);
    } catch (error) {
      console.error('Error loading historical analyses:', error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleStartAnalysis = async () => {
    if (!formData.domain || !formData.brand_name) {
      showNotification('Please enter both domain and brand name', 'error');
      return;
    }

    setIsAnalyzing(true);
    setAnalysisProgress({
      stage: 'initializing',
      message: 'Starting competition analysis...',
      competitorsFound: 0,
      scrapingProgress: 0,
      analysisProgress: 0,
      estimatedTime: null
    });

    try {
      // Call the Competition Analysis endpoint with the required payload shape
      const response = await apiService.startCompetitionAnalysis({
        domain: formData.domain,
        brand_name: formData.brand_name
      });

      // Immediately show results from API
      if (response) {
        setLatestAnalysis(response);
        try { localStorage.setItem('latest_competition_analysis', JSON.stringify(response)); } catch (_) {}
        setIsAnalyzing(false);
        setAnalysisProgress(null);
        showNotification('Competition analysis completed successfully!', 'success');
      }
      
    } catch (error) {
      console.error('Error starting analysis:', error);
      showNotification(`Error starting analysis: ${error.message}`, 'error');
      setIsAnalyzing(false);
      setAnalysisProgress(null);
    }
  };

  const simulateProgress = (analysisId) => {
    // This would be replaced with real progress tracking via WebSocket or polling
    let progress = 0;
    const interval = setInterval(() => {
      progress += Math.random() * 15;
      
      if (progress < 30) {
        setAnalysisProgress(prev => ({
          ...prev,
          stage: 'discovering',
          message: 'Discovering competitors...',
          competitorsFound: Math.min(5, Math.floor(progress / 6)),
          estimatedTime: '3-5 minutes'
        }));
      } else if (progress < 70) {
        setAnalysisProgress(prev => ({
          ...prev,
          stage: 'scraping',
          message: 'Scraping competitor websites...',
          scrapingProgress: Math.min(100, progress),
          estimatedTime: '2-3 minutes'
        }));
      } else if (progress < 95) {
        setAnalysisProgress(prev => ({
          ...prev,
          stage: 'analyzing',
          message: 'Analyzing with AI...',
          analysisProgress: Math.min(100, progress),
          estimatedTime: '1-2 minutes'
        }));
      } else {
        clearInterval(interval);
        setAnalysisProgress(prev => ({
          ...prev,
          stage: 'completed',
          message: 'Analysis completed!',
          analysisProgress: 100
        }));
        
        setTimeout(() => {
          setIsAnalyzing(false);
          setAnalysisProgress(null);
          loadLatestAnalysis();
          loadHistoricalAnalyses();
          showNotification('Competition analysis completed successfully!', 'success');
        }, 1000);
      }
    }, 1000);
  };

  const getAccuracyColor = (accuracy) => {
    if (accuracy >= 80) return 'success';
    if (accuracy >= 60) return 'warning';
    return 'error';
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleViewAnalysis = (row) => {
    const data = row?._full || row;
    if (data) {
      setLatestAnalysis(data);
      // scroll to latest analysis section
      setTimeout(() => {
        const el = document.querySelector('.analysis-section');
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }, 50);
    }
  };

  const handleExportAnalysis = (row) => {
    const data = row?._full || row;
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `competition-analysis-${data.brand}-${new Date(data.timestamp).toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="competition-analysis-screen">
      <div className="container">
        <div className="screen-header">
          <h1>
            <FontAwesomeIcon icon="balance-scale" />
            Competition Analysis
          </h1>
          <p>Analyze your brand against top competitors using AI-powered insights</p>
        </div>

        {/* New Analysis Section */}
        <section className="analysis-section">
          <div className="section-header">
            <h2>Start New Competition Analysis</h2>
          </div>
          
          <div className="analysis-form">
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="domain">Domain</label>
                <input
                  type="text"
                  id="domain"
                  name="domain"
                  value={formData.domain}
                  onChange={handleInputChange}
                  placeholder="e.g., infosys.com"
                  disabled={isAnalyzing}
                />
              </div>
              <div className="form-group">
                <label htmlFor="brand_name">Brand Name</label>
                <input
                  type="text"
                  id="brand_name"
                  name="brand_name"
                  value={formData.brand_name}
                  onChange={handleInputChange}
                  placeholder="e.g., Infosys"
                  disabled={isAnalyzing}
                />
              </div>
              <div className="form-group">
                <button
                  className="btn btn-primary"
                  onClick={handleStartAnalysis}
                  disabled={isAnalyzing}
                >
                  {isAnalyzing ? (
                    <>
                      <FontAwesomeIcon icon="spinner" spin />
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <FontAwesomeIcon icon="search" />
                      Start Analysis
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Progress Display */}
            {analysisProgress && (
              <div className="analysis-progress">
                <div className="progress-header">
                  <h3>{analysisProgress.message}</h3>
                  {analysisProgress.estimatedTime && (
                    <span className="estimated-time">
                      <FontAwesomeIcon icon="clock" />
                      {analysisProgress.estimatedTime}
                    </span>
                  )}
                </div>
                
                <div className="progress-stats">
                  {analysisProgress.competitorsFound > 0 && (
                    <div className="progress-stat">
                      <FontAwesomeIcon icon="users" />
                      <span>{analysisProgress.competitorsFound} competitors found</span>
                    </div>
                  )}
                  
                  {analysisProgress.scrapingProgress > 0 && (
                    <div className="progress-stat">
                      <FontAwesomeIcon icon="globe" />
                      <span>Scraping: {Math.round(analysisProgress.scrapingProgress)}%</span>
                      <div className="progress-bar">
                        <div 
                          className="progress-fill" 
                          style={{ width: `${analysisProgress.scrapingProgress}%` }}
                        ></div>
                      </div>
                    </div>
                  )}
                  
                  {analysisProgress.analysisProgress > 0 && (
                    <div className="progress-stat">
                      <FontAwesomeIcon icon="robot" />
                      <span>Analysis: {Math.round(analysisProgress.analysisProgress)}%</span>
                      <div className="progress-bar">
                        <div 
                          className="progress-fill" 
                          style={{ width: `${analysisProgress.analysisProgress}%` }}
                        ></div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Latest Analysis Section */}
        {latestAnalysis && (
          <section className="analysis-section">
            <div className="section-header">
              <h2>Latest Competition Analysis</h2>
              <span className="analysis-date">{formatDate(latestAnalysis.timestamp)}</span>
            </div>

            {/* Main Brand Summary */}
            <div className="brand-summary-card">
              <div className="brand-info">
                <h3>{latestAnalysis.brand}</h3>
                <span className="domain">{latestAnalysis.domain}</span>
                <span className="analysis-timestamp">
                  <FontAwesomeIcon icon="calendar" />
                  {formatDate(latestAnalysis.timestamp)}
                </span>
              </div>
              
              <div className="accuracy-score">
                <div className={`score-circle ${getAccuracyColor(latestAnalysis.analysis.summary.accuracy_percent)}`}>
                  <span className="score">{latestAnalysis.analysis.summary.accuracy_percent}%</span>
                  <span className="label">Accuracy</span>
                </div>
              </div>
              
              <div className="answer-distribution">
                <div className="distribution-item success">
                  <FontAwesomeIcon icon="check-circle" />
                  <span>{latestAnalysis.analysis.summary.correct} Correct</span>
                </div>
                <div className="distribution-item warning">
                  <FontAwesomeIcon icon="exclamation-triangle" />
                  <span>{latestAnalysis.analysis.summary.partially_correct} Partial</span>
                </div>
                <div className="distribution-item error">
                  <FontAwesomeIcon icon="times-circle" />
                  <span>{latestAnalysis.analysis.summary.incorrect} Incorrect</span>
                </div>
              </div>
            </div>

            {/* Competition Comparison Table */}
            <div className="competition-table-section">
              <h3>Competition Comparison</h3>
              <div className="competition-table-wrapper">
                <table className="competition-table">
                  <thead>
                    <tr>
                      <th>Brand</th>
                      <th>Overall Score</th>
                      <th>Correct</th>
                      <th>Partial</th>
                      <th>Incorrect</th>
                      <th>Performance</th>
                    </tr>
                  </thead>
                  <tbody>
                    {/* Main Brand Row */}
                    <tr className="main-brand-row">
                      <td>
                        <div className="brand-cell-content">
                          <strong>{latestAnalysis.brand}</strong>
                          <span className="domain-text">{latestAnalysis.domain}</span>
                        </div>
                      </td>
                      <td>
                        <div className={`score-badge ${getAccuracyColor(latestAnalysis.analysis.summary.accuracy_percent)}`}>
                          {latestAnalysis.analysis.summary.accuracy_percent}%
                        </div>
                      </td>
                      <td>
                        <div className="metric-cell success">
                          <FontAwesomeIcon icon="check-circle" />
                          {latestAnalysis.analysis.summary.correct}
                        </div>
                      </td>
                      <td>
                        <div className="metric-cell warning">
                          <FontAwesomeIcon icon="exclamation-triangle" />
                          {latestAnalysis.analysis.summary.partially_correct}
                        </div>
                      </td>
                      <td>
                        <div className="metric-cell error">
                          <FontAwesomeIcon icon="times-circle" />
                          {latestAnalysis.analysis.summary.incorrect}
                        </div>
                      </td>
                      <td>
                        <span className="performance-indicator main">
                          <FontAwesomeIcon icon="star" />
                          Main Brand
                        </span>
                      </td>
                    </tr>
                    
                    {/* Competitor Rows */}
                    {latestAnalysis.competitor_analyses.map((competitor, index) => (
                      <tr key={index}>
                        <td>
                          <div className="brand-cell-content">
                            <strong>{competitor.brand}</strong>
                            <span className="domain-text">{competitor.domain}</span>
                          </div>
                        </td>
                        <td>
                          <div className={`score-badge ${getAccuracyColor(competitor.analysis.summary.accuracy_percent)}`}>
                            {competitor.analysis.summary.accuracy_percent}%
                          </div>
                        </td>
                        <td>
                          <div className="metric-cell success">
                            <FontAwesomeIcon icon="check-circle" />
                            {competitor.analysis.summary.correct}
                          </div>
                        </td>
                        <td>
                          <div className="metric-cell warning">
                            <FontAwesomeIcon icon="exclamation-triangle" />
                            {competitor.analysis.summary.partially_correct}
                          </div>
                        </td>
                        <td>
                          <div className="metric-cell error">
                            <FontAwesomeIcon icon="times-circle" />
                            {competitor.analysis.summary.incorrect}
                          </div>
                        </td>
                        <td>
                          {competitor.analysis.summary.accuracy_percent > latestAnalysis.analysis.summary.accuracy_percent ? (
                            <span className="performance-indicator better">
                              <FontAwesomeIcon icon="arrow-up" />
                              Better
                            </span>
                          ) : competitor.analysis.summary.accuracy_percent < latestAnalysis.analysis.summary.accuracy_percent ? (
                            <span className="performance-indicator worse">
                              <FontAwesomeIcon icon="arrow-down" />
                              Worse
                            </span>
                          ) : (
                            <span className="performance-indicator equal">
                              <FontAwesomeIcon icon="minus" />
                              Equal
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Detailed Analysis per Brand */}
            <div className="qa-section">
              <h3>Detailed Analysis</h3>
              
              {/* Main Brand Full Q&A */}
              <div className="brand-detailed-section">
                <div className="section-header compact">
                  <h4>
                    {latestAnalysis.brand} • {latestAnalysis.domain}
                  </h4>
                  <div className={`score-badge ${getAccuracyColor(latestAnalysis.analysis.summary.accuracy_percent)}`}>
                    {latestAnalysis.analysis.summary.accuracy_percent}% Accuracy
                  </div>
                </div>
              <div className="qa-grid">
                  {latestAnalysis.analysis.answers.map((answer, index) => (
                    <div key={`main-${answer.id}-${index}`} className="qa-card">
                      <div className="qa-question-header">
                        <span className="qa-qnum">Q{answer.id}</span>
                        <h4 className="qa-title">{answer.question}</h4>
                    </div>
                    <div className="answer-section">
                      <div className="main-brand-answer">
                        <h5>{latestAnalysis.brand} Answer:</h5>
                        <p>{answer.answer}</p>
                          <div className="answer-meta">
                            <span className={`evaluation-badge ${answer.evaluation.toLowerCase().replace(' ', '-')}`}>
                          <FontAwesomeIcon 
                            icon={answer.evaluation === 'Correct' ? 'check-circle' : 
                                  answer.evaluation === 'Partially Correct' ? 'exclamation-triangle' : 
                                  'times-circle'} 
                          />
                            <span className="badge-text">{answer.evaluation}</span>
                            </span>
                            <span className="confidence-badge">
                              {typeof answer.confidence === 'number' ? `${answer.confidence}% confidence` : '—'}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                        </div>
                      </div>
                      
              {/* Competitors Full Q&A */}
              {latestAnalysis.competitor_analyses.map((competitor, cIdx) => (
                <div key={`comp-block-${cIdx}`} className="brand-detailed-section">
                  <div className="section-header compact">
                    <h4>
                      {competitor.brand} • {competitor.domain}
                    </h4>
                    <div className={`score-badge ${getAccuracyColor(competitor.analysis.summary.accuracy_percent)}`}>
                      {competitor.analysis.summary.accuracy_percent}% Accuracy
                    </div>
                  </div>
                  <div className="qa-grid">
                    {competitor.analysis.answers.map((answer, index) => (
                      <div key={`comp-${cIdx}-${answer.id}-${index}`} className="qa-card">
                        <div className="qa-question-header">
                          <span className="qa-qnum">Q{answer.id}</span>
                          <h4 className="qa-title">{answer.question}</h4>
                        </div>
                        <div className="answer-section">
                          <div className="main-brand-answer">
                            <h5>{competitor.brand} Answer:</h5>
                            <p>{answer.answer || 'No answer available'}</p>
                            <div className="answer-meta">
                              <span className={`evaluation-badge ${answer.evaluation.toLowerCase().replace(' ', '-')}`}>
                                  <FontAwesomeIcon 
                                icon={answer.evaluation === 'Correct' ? 'check-circle' : 
                                      answer.evaluation === 'Partially Correct' ? 'exclamation-triangle' : 
                                          'times-circle'} 
                                  />
                                <span className="badge-text">{answer.evaluation}</span>
                              </span>
                              <span className="confidence-badge">
                                {typeof answer.confidence === 'number' ? `${answer.confidence}% confidence` : '—'}
                              </span>
                                </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Historical Analyses Section */}
        {historicalAnalyses.length > 0 && (
          <section className="analysis-section">
            <div className="section-header">
              <h2>Previous Analyses</h2>
            </div>
            
            <div className="historical-table">
              <table>
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Brand</th>
                    <th>Competitors</th>
                    <th>Performance</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {historicalAnalyses.slice(0, 10).map((analysis, index) => (
                    <tr key={index}>
                      <td>{formatDate(analysis.timestamp)}</td>
                      <td>
                        <div className="brand-cell">
                          <strong>{analysis.brand}</strong>
                          <span className="domain">{analysis.domain}</span>
                        </div>
                      </td>
                      <td>{analysis.summary.competitor_count}</td>
                      <td>
                        <div className={`performance-badge ${getAccuracyColor(analysis.summary.accuracy_percent)}`}>
                          {analysis.summary.accuracy_percent}%
                        </div>
                      </td>
                      <td>
                        <div className="action-buttons">
                          <button className="btn btn-sm btn-outline" onClick={() => handleViewAnalysis(analysis)}>
                            <FontAwesomeIcon icon="eye" />
                            View
                          </button>
                          <button className="btn btn-sm btn-outline" onClick={() => handleExportAnalysis(analysis)}>
                            <FontAwesomeIcon icon="download" />
                            Export
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}
      </div>
    </div>
  );
};

export default CompetitionAnalysisScreen;
