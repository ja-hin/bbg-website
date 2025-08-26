laimStatus: customer.claim_status,
              claimId: customer.claim_id,
              deviceAge: deviceAgeMonths,
              estimatedPayout: Math.round(estimatedPayout),
              claimPercentage: claimPercentage,
            };
          }),
        );

        // Apply status filter after processing (since it's related to calculated claim status)
        let filteredCustomers = customersWithPayout;
        if (status && status !== "all") {
          filteredCustomers = customersWithPayout.filter((customer) => {
            if (status === "claimed") return customer.claimStatus !== null;
            if (status === "unclaimed") return customer.claimStatus === null;
            return customer.claimStatus === status;
          });
        }

        res.json(filteredCustomers);
      } catch (error: any) {
        console.error("Error fetching customer registrations:", error);
        res
          .status(500)
          .json({
            message: "Failed to fetch customer registrations",
            error: error.message,
          });
      }
    },
  );

  // ===== HOMEPAGE BANNER MANAGEMENT ROUTES =====

  // Public endpoint - Get active homepage banners (for frontend display)
  app.get("/api/homepage-banners", async (req, res) => {
    try {
      const banners = await storage.getActiveHomepageBanners();
      res.json(banners);
    } catch (error: any) {
      console.error("Error fetching homepage banners:", error);
      res.status(500).json({ message: "Failed to get homepage banners" });
    }
  });

  // Public endpoint - Redirect to S3 for images (S3-only implementation)
  app.get("/uploads/:filename", async (req, res) => {
    const filename = req.params.filename;

    try {
      // Generate signed URL for S3 file access
      const signedUrl = await s3Service.getSignedUrl(`documents/${filename}`);

      // Redirect to S3 signed URL
      res.redirect(signedUrl);
    } catch (error) {
      console.error("Error accessing S3 file:", error);
      res.status(404).json({ message: "Image not found" });
    }
  });

  // Admin endpoint - Get all homepage banners (including inactive ones)
  app.get(
    "/api/admin/homepage-banners",
    isAdminAuthenticated,
    async (req, res) => {
      try {
        const banners = await storage.getAllHomepageBanners();
        res.json(banners);
      } catch (error: any) {
        console.error("Error fetching all homepage banners:", error);
        res.status(500).json({ message: "Failed to get homepage banners" });
      }
    },
  );

  // Admin endpoint - Create homepage banner
  app.post(
    "/api/admin/homepage-banners",
    isAdminAuthenticated,
    bannerUpload.fields([
      { name: "desktopImage", maxCount: 1 },
      { name: "mobileImage", maxCount: 1 },
    ]),
    async (req, res) => {
      try {
        const { title, description, linkUrl, isActive, sortOrder } = req.body;
        const files = req.files as {
          [fieldname: string]: Express.Multer.File[];
        };

        if (!title) {
          return res.status(400).json({ message: "Title is required" });
        }

        if (!files?.desktopImage || !files?.mobileImage) {
          return res
            .status(400)
            .json({ message: "Both desktop and mobile images are required" });
        }

        // Get S3 image URLs
        const desktopImageUrl = (files.desktopImage[0] as any).location;
        const mobileImageUrl = (files.mobileImage[0] as any).location;

        const banner = await storage.createHomepageBanner({
          title,
          description,
          desktopImageUrl,
          mobileImageUrl,
          linkUrl,
          isActive: isActive === "true",
          sortOrder: parseInt(sortOrder) || 0,
        });

        res.status(201).json({
          message: "Homepage banner created successfully",
          banner,
        });
      } catch (error: any) {
        console.error("Error creating homepage banner:", error);
        res.status(500).json({ message: "Failed to create homepage banner" });
      }
    },
  );

  // Admin endpoint - Update homepage banner
  app.put(
    "/api/admin/homepage-banners/:id",
    isAdminAuthenticated,
    bannerUpload.fields([
      { name: "desktopImage", maxCount: 1 },
      { name: "mobileImage", maxCount: 1 },
    ]),
    async (req, res) => {
      try {
        const bannerId = parseInt(req.params.id);
        const { title, description, linkUrl, isActive, sortOrder } = req.body;
        const files = req.files as {
          [fieldname: string]: Express.Multer.File[];
        };

        if (isNaN(bannerId)) {
          return res.status(400).json({ message: "Invalid banner ID" });
        }

        const updates: any = {};

        if (title !== undefined) updates.title = title;
        if (description !== undefined) updates.description = description;
        if (linkUrl !== undefined) updates.linkUrl = linkUrl;
        if (isActive !== undefined) updates.isActive = isActive === "true";
        if (sortOrder !== undefined) updates.sortOrder = parseInt(sortOrder);

        // Update S3 image URLs if new files are provided
        if (files?.desktopImage) {
          updates.desktopImageUrl = (files.desktopImage[0] as any).location;
        }

        if (files?.mobileImage) {
          updates.mobileImageUrl = (files.mobileImage[0] as any).location;
        }

        await storage.updateHomepageBanner(bannerId, updates);

        res.json({ message: "Homepage banner updated successfully" });
      } catch (error: any) {
        console.error("Error updating homepage banner:", error);
        res.status(500).json({ message: "Failed to update homepage banner" });
      }
    },
  );

  // Admin endpoint - Delete homepage banner
  app.delete(
    "/api/admin/homepage-banners/:id",
    isAdminAuthenticated,
    async (req, res) => {
      try {
        const bannerId = parseInt(req.params.id);

        if (isNaN(bannerId)) {
          return res.status(400).json({ message: "Invalid banner ID" });
        }

        await storage.deleteHomepageBanner(bannerId);

        res.json({ message: "Homepage banner deleted successfully" });
      } catch (error: any) {
        console.error("Error deleting homepage banner:", error);
        res.status(500).json({ message: "Failed to delete homepage banner" });
      }
    },
  );

  // Admin endpoint - Get single homepage banner by ID
  app.get(
    "/api/admin/homepage-banners/:id",
    isAdminAuthenticated,
    async (req, res) => {
      try {
        const bannerId = parseInt(req.params.id);

        if (isNaN(bannerId)) {
          return res.status(400).json({ message: "Invalid banner ID" });
        }

        const banner = await storage.getHomepageBannerById(bannerId);

        if (!banner) {
          return res.status(404).json({ message: "Homepage banner not found" });
        }

        res.json(banner);
      } catch (error: any) {
        console.error("Error fetching homepage banner:", error);
        res.status(500).json({ message: "Failed to get homepage banner" });
      }
    },
  );

  // S3 Test endpoints for admin
  app.post('/api/admin/s3-test/upload', isAdminAuthenticated, upload.single('pdf'), async (req: any, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ 
          success: false, 
          message: 'No PDF file uploaded' 
        });
      }

      // Validate file type
      if (req.file.mimetype !== 'application/pdf') {
        return res.status(400).json({ 
          success: false, 
          message: 'Only PDF files are allowed' 
        });
      }

      const fileName = req.file.originalname;
      const fileSize = req.file.size;

      let s3Key: string;
      
      if (req.file.location) {
        // S3 upload - extract key from location URL
        const url = new URL(req.file.location);
        s3Key = url.pathname.substring(1); // Remove leading slash
      } else if (req.file.key) {
        // S3 upload - use key directly
        s3Key = req.file.key;
      } else {
        return res.status(500).json({ 
          success: false, 
          message: 'File upload failed - no S3 key generated' 
        });
      }

      console.log(`📄 S3 Test Upload Success: ${fileName} -> ${s3Key}`);

      res.json({
        success: true,
        message: `PDF file uploaded successfully to S3`,
        s3Key,
        fileName,
        size: fileSize
      });

    } catch (error) {
      console.error('S3 Test Upload Error:', error);
      res.status(500).json({ 
        success: false, 
        message: error instanceof Error ? error.message : 'Upload failed' 
      });
    }
  });

  app.get('/api/admin/s3-test/download/:s3Key(*)', isAdminAuthenticated, async (req, res) => {
    try {
      const s3Key = decodeURIComponent(req.params.s3Key);
      
      if (!s3Key) {
        return res.status(400).json({ 
          success: false, 
          message: 'S3 key is required' 
        });
      }

      // Generate signed URL for download
      const downloadUrl = await s3Service.getSignedUrl(s3Key, 3600); // 1 hour expiry
      
      console.log(`📄 S3 Test Download URL Generated: ${s3Key}`);

      res.json({
        success: true,
        downloadUrl,
        s3Key
      });

    } catch (error) {
      console.error('S3 Test Download Error:', error);
      res.status(500).json({ 
        success: false, 
        message: error instanceof Error ? error.message : 'Failed to generate download URL' 
      });
    }
  });

  const httpServer = createServer(app);
  return httpServer;

  // Helper function to check database connection
  async function checkDatabaseConnection() {
    try {
      await sql.connect(config);
      return {
        status: "connected",
        host: config.server,
        database: config.database,
      };
    } catch (error) {
      return {
        status: "disconnected",
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }
}
